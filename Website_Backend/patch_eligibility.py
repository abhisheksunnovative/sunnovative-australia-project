import os

controller_path = "src/controllers/bdeController.js"
with open(controller_path, "r", encoding="utf8") as f:
    content = f.read()

func = """export const markLeadEligible = async (req, res) => {
  try {
    const { leadId } = req.params;
    const { isEligibleForInstallation } = req.body;
    const Lead = (await import("../models/Lead.js")).default || (await import("../models/Lead.js")).Lead;
    const lead = await Lead.findByIdAndUpdate(
      leadId,
      { isEligibleForInstallation },
      { new: true }
    );
    if (!lead) return res.status(404).json({ success: false, message: "Lead not found" });
    res.json({ success: true, lead });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
"""

if "markLeadEligible" not in content:
    with open(controller_path, "a", encoding="utf8") as f:
        f.write("\n" + func)

routes_path = "src/routes/bdeRoutes.js"
with open(routes_path, "r", encoding="utf8") as f:
    rcontent = f.read()

if "markLeadEligible" not in rcontent:
    rcontent = rcontent.replace('updateBDELeadDetails,', 'updateBDELeadDetails, markLeadEligible,')
    rcontent = rcontent.replace('router.put("/leads/:leadId/details", updateBDELeadDetails);', 'router.put("/leads/:leadId/details", updateBDELeadDetails);\nrouter.put("/leads/:leadId/eligibility", markLeadEligible);')
    with open(routes_path, "w", encoding="utf8") as f:
        f.write(rcontent)

print("Done")
