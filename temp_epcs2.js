export const getAvailableEpcs = async (req, res) => {
  try {
    const fs = await import('fs');
    fs.appendFileSync('epc_requests.log', JSON.stringify({ query: req.query, date: new Date() }) + '\n');
    
    const { state, district, country = req.customer?.country || 'india' } = req.query;
    const { default: EpcPartner } = await import('../models/EpcPartner.js');
    
    const isAu = country.toLowerCase() === 'australia';

    // Find EPCs matching state and district (and must be verified/active)
    // If Australia, we need to match by country too.
    // Support existing serviceAreas or activeDistricts
    // We removed isVerified: true because user requested EPCs with rates should show instantly without admin approval
    let query = {};
    if (isAu) {
      query.country = "australia";
    }
    
    const stateRegex = new RegExp(`^${state || 'Queensland'}$`, 'i');
    const stateMatch = { $in: [stateRegex, /^all$/i] };
    
    query.$or = [
      { serviceAreas: { $elemMatch: { state: stateMatch } } },
      { activeDistricts: stateMatch }
    ];
    // Keep standard fallback
    if (!state) {
        query.$or[0].serviceAreas.$elemMatch.state = { $in: [/^Gujarat$/i, /^all$/i] };
        query.$or[1].activeDistricts = { $in: [/^Gujarat$/i, /^all$/i] };
    }

    if (district && district !== 'All') {
       const distRegex = new RegExp(`^${district}$`, 'i');
       query.$or[0].serviceAreas.$elemMatch.district = { $in: [distRegex, /^all$/i] };
       query.$or[1].activeDistricts = { $in: [distRegex, /^all$/i] };
    }

    let brandIds = [];
    if (req.query.brands) {
      let brandsQuery = typeof req.query.brands === 'string' ? req.query.brands.split(',') : req.query.brands;
      const { default: Brand } = await import('../models/Brand.js');
      const brandDocs = await Brand.find({ name: { $in: brandsQuery.map(b => new RegExp('^' + b.trim() + '$', 'i')) } });
      brandIds = brandDocs.map(b => b._id);
      
      if (brandIds.length > 0) {
        // Find EPCs who have submitted rates for these brands in ProjectPricing
        const { default: ProjectPricing } = await import('../models/ProjectPricing.js');
        const pricingDocs = await ProjectPricing.find({
          dynamicBrands: {
            $elemMatch: {
              brandIds: { $in: brandIds }
            }
          }
        });
        
        const epcIdsWithRates = pricingDocs.map(p => p.epcId).filter(id => id);

        // Also check older brandOfferings just in case
        query.$and = query.$and || [];
        query.$and.push({
          $or: [
            { _id: { $in: epcIdsWithRates } },
            {
              brandOfferings: {
                $elemMatch: {
                  $or: [
                    { solarBrands: { $in: brandIds } },
                    { inverterBrands: { $in: brandIds } }
                  ]
                }
              }
            }
          ]
        });
      } else {
        return res.json({ success: true, count: 0, data: [] });
      }
    }

    let epcs = await EpcPartner.find(query)
       .select('companyName contactPerson totalExperience rating totalInstallations profilePic installerCount weeklyCapacityKw trustBadge country');

    // Also get fallback if no district match (but state match)
    if (epcs.length === 0 && district && district !== 'All') {
      let fallbackQuery = {};
      if (isAu) fallbackQuery.country = "australia";
      
      fallbackQuery.$or = [
        { serviceAreas: { $elemMatch: { state: stateMatch } } },
        { activeDistricts: stateMatch }
      ];
      
      if (query.$and) {
          fallbackQuery.$and = query.$and;
      }
      
      epcs = await EpcPartner.find(fallbackQuery)
         .select('companyName contactPerson totalExperience rating totalInstallations profilePic installerCount weeklyCapacityKw trustBadge country');
    }

    let finalEpcs = epcs;
    if (isAu) {
      const { default: EpcSystemSettings } = await import('../models/EpcSystemSettings.js');
      const sysSettings = await EpcSystemSettings.getSingleton();
      let limit = 5; // default fallback
      let priorities = ['lowestLeads', 'rating']; // default fallback

      if (sysSettings.regionRules) {
        const resolvedState = state || 'Victoria';
        const resolvedProjectType = req.query.projectType || 'residential';
        const rule = sysSettings.regionRules.find(r => 
           r.country.toLowerCase() === country.toLowerCase() && 
           r.state.toLowerCase() === resolvedState.toLowerCase() && 
           r.projectType === resolvedProjectType
        ) || sysSettings.regionRules.find(r => 
           r.country.toLowerCase() === country.toLowerCase() && 
           r.state.toLowerCase() === 'all' && 
           r.projectType === resolvedProjectType
        );
        if (rule) {
           limit = rule.customerSelectEpcSettings?.totalEpcCards || limit;
        }
      }

      if (true) {
        
        // Helper to sort considering priorities (0 orders/lowest leads, rating)
        const sortEpcs = (list) => {
          return list.sort((a, b) => {
            for (let prio of priorities) {
              if (prio === 'rating') {
                if (b.rating !== a.rating) return (b.rating || 0) - (a.rating || 0);
              }
              if (prio === 'lowestLeads') {
                if (a.totalInstallations !== b.totalInstallations) return (a.totalInstallations || 0) - (b.totalInstallations || 0);
              }
            }
            return 0;
          });
        };

        // 1. Separate Trust Badge and Non-Trust Badge EPCs
        let tbEpcs = [];
        let nmEpcs = [];
        finalEpcs.forEach(epc => {
           if (epc.trustBadge?.status === 'Approved') tbEpcs.push(epc);
           else nmEpcs.push(epc);
        });

        // 2. Sort both lists
        tbEpcs = sortEpcs(tbEpcs);
        nmEpcs = sortEpcs(nmEpcs);

        // 3. Dynamic Ratio Algorithm
        const totalPool = tbEpcs.length + nmEpcs.length;
        if (totalPool === 0) {
          finalEpcs = [];
        } else {
          const tbRatio = tbEpcs.length / totalPool;
          let tbCount = 0;
          let nmCount = 0;

          if (tbEpcs.length === 0) {
            nmCount = limit;
          } else if (tbRatio < 0.5) {
            tbCount = Math.ceil(limit * 0.5);
            nmCount = limit - tbCount;
          } else if (tbRatio >= 0.5 && tbRatio <= 0.6) {
            tbCount = Math.ceil(limit * 0.6);
            nmCount = limit - tbCount;
          } else {
            tbCount = Math.ceil(limit * 0.8);
            nmCount = limit - tbCount;
          }

          if (tbEpcs.length < tbCount) {
             nmCount += (tbCount - tbEpcs.length);
             tbCount = tbEpcs.length;
          }
          if (nmEpcs.length < nmCount) {
             tbCount += (nmCount - nmEpcs.length);
             nmCount = nmEpcs.length;
          }
          // Final cap: ensure counts don't exceed available
          tbCount = Math.min(tbCount, tbEpcs.length);
          nmCount = Math.min(nmCount, nmEpcs.length);

          finalEpcs = [
            ...tbEpcs.slice(0, tbCount),
            ...nmEpcs.slice(0, nmCount)
          ];
          
          // Re-sort final list so Trust Badge holders appear above NM based on priority
          finalEpcs.sort((a, b) => {
            const aTrust = a.trustBadge?.status === 'Approved' ? 1 : 0;
            const bTrust = b.trustBadge?.status === 'Approved' ? 1 : 0;
            if (bTrust !== aTrust) return bTrust - aTrust;
            for (let prio of priorities) {
              if (prio === 'rating') {
                if (b.rating !== a.rating) return (b.rating || 0) - (a.rating || 0);
              }
              if (prio === 'lowestLeads') {
                if (a.totalInstallations !== b.totalInstallations) return (a.totalInstallations || 0) - (b.totalInstallations || 0);
              }
            }
            return 0;
          });
        }
      }
    }

    // Decrement views for Trust Badge holders that are being shown
    if (finalEpcs.length > 0) {
      const tbShownIds = finalEpcs
        .filter(epc => epc.trustBadge?.status === 'Approved' && epc.trustBadge?.remainingViews > 0)
        .map(epc => epc._id);
      
      if (tbShownIds.length > 0) {
        for (const epcId of tbShownIds) {
          const epc = await EpcPartner.findById(epcId);
          if (epc && epc.trustBadge) {
            epc.trustBadge.remainingViews -= 1;
            epc.trustBadge.skippedCount = (epc.trustBadge.skippedCount || 0) + 1;
            
            if (epc.trustBadge.remainingViews <= 0) {
              epc.trustBadge.status = 'Expired';
              const Notification = (await import('../models/Notification.js')).default;
              await Notification.create({
                role: 'EpcPartner',
                recipientId: epc._id,
                title: 'Trust Badge Expired',
                message: 'Your Trust Badge has expired because you have used all your views. Please apply again.'
              });
            }
            await epc.save();
          }
        }
      }
    }

    const { kw, projectType } = req.query;
    let finalEpcsObj = finalEpcs.map(e => e.toObject ? e.toObject() : e);

    if (kw && projectType) {
      const { default: ProjectPricing } = await import('../models/ProjectPricing.js');
      const searchPattern = '^' + projectType.replace('-solar', '') + '(-solar)?$';
      const pricingDocs = await ProjectPricing.find({
        epcId: { $in: finalEpcsObj.map(e => e._id) },
        systemSizeKW: Number(kw),
        projectType: new RegExp(searchPattern, 'i')
      }).lean();

      const brandIdStrings = brandIds.map(id => id.toString());

      finalEpcsObj = finalEpcsObj.map(epc => {
        const epcPricing = pricingDocs.filter(p => {
          if (!p.epcId || p.epcId.toString() !== epc._id.toString()) return false;
          
          if (brandIdStrings.length > 0) {
            const hasDirectBrand = (p.solarPanel && brandIdStrings.includes(p.solarPanel.toString())) ||
                                   (p.inverter && brandIdStrings.includes(p.inverter.toString()));
            if (hasDirectBrand) return true;
            
            if (p.dynamicBrands && p.dynamicBrands.length > 0) {
              const hasDynamicBrand = p.dynamicBrands.some(db => 
                db.brandIds && db.brandIds.some(bid => brandIdStrings.includes(bid.toString()))
              );
              return hasDynamicBrand;
            }
            return false;
          }
          return true;
        });

        const validPrices = epcPricing.map(p => p.projectPrice || 0).filter(p => p > 0);
        if (validPrices.length > 0) {
           epc.projectPrice = Math.min(...validPrices);
        }
        return epc;
      });
    }

    res.json({ success: true, count: finalEpcsObj.length, data: finalEpcsObj });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// -- POST /api/customer/projects/:id/complete-step -- Complete a customer assigned step --
export const completeStep = async (req, res) => {
  try {
    const { stepId, note, uploadedActions: rawActions } = req.body;
    
    const project = await ProjectOrder.findOne({
      _id: req.params.id,
      $or: [
        { customerId: req.customer._id.toString() },
        { customerMobile: req.customer.mobile }
      ]
    });
    
    if (!project) return res.status(404).json({ message: 'Project not found' });

    let uploadedActions = [];
    if (rawActions) {
      try {
        uploadedActions = typeof rawActions === 'string' ? JSON.parse(rawActions) : rawActions;
      } catch (err) {
        console.error('Error parsing uploadedActions:', err);
      }
    }

    let fileUrl = "";
    if (req.file) {
      fileUrl = `/${req.file.path.replace(/\\/g, '/')}`;
    }

    const result = await processStepCompletionEngine(
      project,
      stepId,
      req.customer.name || 'Customer',
      fileUrl,
      note || '',
      'customer',
      uploadedActions
    );

    if (!result.success) {
      return res.status(400).json({ success: false, message: result.message });
    }

    await project.save();
    res.json({ success: true, message: 'Step completed successfully', project });
  } catch (error) {
    console.error('Customer completeStep error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const signStcForm = async (req, res) => {
  try {
    const { signatureUrl } = req.body;
    const project = await ProjectOrder.findOne({ _id: req.params.id, customer: req.customer._id });
    if (!project) return res.status(404).json({ message: "Project not found" });
    
    if (!project.stcStatus) {
      project.stcStatus = {};
    }
    
    project.stcStatus.assignmentFormSigned = true;
    project.stcStatus.assignmentFormSignedAt = new Date();
    project.stcStatus.customerSignatureUrl = signatureUrl;
    await project.save();
    
    res.json({ success: true, message: "STC Assignment Form signed successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


export const rateEpc = async (req, res) => {
  try {
    const { rating, reviewComment, comment, feedback } = req.body;
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, message: 'Invalid rating. Must be between 1 and 5.' });
    }

    const project = await ProjectOrder.findOne({
      _id: req.params.id,
      $or: [
        { customerId: req.customer._id.toString() },
        { customerMobile: req.customer.mobile },
      ],
    });

    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });
    if (!project.assignedEPCId) {
      return res.status(400).json({ success: false, message: 'No installer assigned to this project yet.' });
    }
    if (project.customerRating > 0) {
      return res.status(400).json({ success: false, message: 'You have already rated this installer.' });
    }

    // Check if the project is completed
    const isCompleted = ["completed", "closed", "Project Completed", "Warranty Activated", "Installation Completed"].includes(project.status) || project.completionPercentage >= 90;
    if (!isCompleted) {
      return res.status(400).json({ success: false, message: 'Rating can only be submitted after the installation is completed.' });
    }

    const { default: EpcPartner } = await import('../models/EpcPartner.js');
    const epc = await EpcPartner.findById(project.assignedEPCId);
    if (epc) {
      const currentTotal = epc.totalRatings || 0;
      const currentRating = epc.rating || 0;
      const newTotal = currentTotal + 1;
      const newAvgRating = ((currentRating * currentTotal) + Number(rating)) / newTotal;

      epc.rating = Math.round(newAvgRating * 10) / 10;
      epc.totalRatings = newTotal;

      if (epc.rating < 3.0 && epc.totalRatings >= 3) {
        epc.isActive = false;
        epc.deactivationReason = "Auto-deactivated due to average rating falling below 3.0 stars";
      }

      await epc.save();
    }

    project.customerRating = Number(rating);
    project.customerReviewComment = reviewComment || comment || feedback || "";
    project.customerRatedAt = new Date();
    await project.save();

    res.json({ 
      success: true, 
      message: 'Thank you for your rating and feedback!', 
      customerRating: project.customerRating,
      customerReviewComment: project.customerReviewComment
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateProjectDetail = async (req, res) => {
  try {
    const { address, city, pincode, preferredInstallDate, latitude, longitude } = req.body;
    
    const project = await ProjectOrder.findOne({
      _id: req.params.id,
      $or: [
        { customerId: req.customer._id.toString() },
        { customerMobile: req.customer.mobile }
      ]
    });

    if (!project) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }

    if (project.location) {
      if (address) project.location.address = address;
      if (city) project.location.city = city;
      if (pincode) project.location.pincode = pincode;
    } else {
      project.location = { address, city, pincode, state: project.state };
    }

    if (preferredInstallDate) {
      project.preferredInstallDate = new Date(preferredInstallDate);
    }
    if (latitude) project.latitude = Number(latitude);
    if (longitude) project.longitude = Number(longitude);

    if (req.file) {
      project.rooftopPhoto = `/uploads/${req.file.filename}`;
    }

    await project.save();
    res.json({ success: true, message: "Project details updated successfully", data: project });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const selectRecommendedEpc = async (req, res) => {
  try {
    const { id } = req.params;
    const { epcId } = req.body;
    if (!epcId) return res.status(400).json({ success: false, message: 'Please select an EPC Partner' });

    const project = await ProjectOrder.findOne({
      _id: id,
      $or: [
        { customerId: req.customer._id.toString() },
        { customerMobile: req.customer.mobile }
      ]
    });

    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });

    const { default: EpcPartner } = await import('../models/EpcPartner.js');
    const epc = await EpcPartner.findById(epcId);
    if (!epc) return res.status(404).json({ success: false, message: 'EPC Partner not found' });

    project.assignedEPCId = epc._id;
    project.assignedEPCName = epc.companyName;
    project.bdeRecommendationStatus = 'accepted';
    project.status = 'EPC Accepted';
    project.pendingActionAlert = 'EPC Accepted your project! Site survey scheduled.';
    project.pendingActionFor = 'epc-partner';

    await project.save();

    // Track Trust Badge Assignment & Skipped Analytics
    try {
      if (epc.trustBadge?.status === 'Approved') {
        epc.trustBadge.assignedCount = (epc.trustBadge.assignedCount || 0) + 1;
        epc.trustBadge.skippedCount = Math.max(0, (epc.trustBadge.skippedCount || 0) - 1);
        await epc.save();
      }
    } catch (err) { 
      console.error('Error updating trustbadge counters:', err); 
    }

    // Sync Lead model
    try {
      const LeadModel = (await import('../models/Lead.js')).default;
      await LeadModel.updateOne(
        { $or: [{ convertedProjectId: project._id }, { mobile: project.customerMobile }] },
        { 
          assignedEPCId: epc._id, 
          assignedEPCName: epc.companyName, 
          enquiryStatus: 'EPC Accepted',
          epcDetails: {
            companyName: epc.companyName,
            contactPerson: epc.ownerName || epc.contactPerson,
            mobile: epc.mobile,
            email: epc.email,
            rating: epc.rating
          }
        }
      );
    } catch (lErr) {
      console.error('Lead update error:', lErr);
    }

    // Trigger Notification for BDE & Admin
    try {
      const Notification = (await import('../models/Notification.js')).default;
      await Notification.create({
        role: 'BDE',
        recipientId: project.assignedBde ? project.assignedBde : null,
        title: '⚡ Customer Accepted EPC Installer!',
        message: `Customer ${project.customerName} has accepted ${epc.companyName}. You can now align and confirm the final installation date!`,
        projectId: project._id
      });
    } catch (nErr) {
      console.error('BDE notification error:', nErr);
    }

    res.json({ success: true, project, message: `Successfully accepted ${epc.companyName} as your EPC installer!` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};








export const cancelOverdueProject = async (req, res) => {
  try {
    const { ProjectOrder } = await import('../models/ProjectModel.js');
    const Lead = (await import('../models/Lead.js')).default || (await import('../models/Lead.js')).Lead;
    
    const projectId = req.params.id;
    const project = await ProjectOrder.findById(projectId);
    
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });
    if (project.customerId.toString() !== req.customer.id) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    // Soft delete: update status to Cancelled
    project.status = 'Cancelled';
    project.history = project.history || [];
    project.history.push({ action: 'Customer cancelled due to overdue installation date selection', date: new Date() });
    await project.save();

    // Soft delete lead if exists
    if (project.leadId) {
      await Lead.findByIdAndUpdate(project.leadId, { 
        status: 'Lost',
        $push: { history: { action: 'Project Cancelled by Customer (Overdue)', date: new Date() } }
      });
    }

    res.json({ success: true, message: 'Project cancelled successfully' });
  } catch (error) {
    console.error('Cancel overdue project error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
