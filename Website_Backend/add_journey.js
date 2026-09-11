import mongoose from 'mongoose';
import { OrderJourneySettings } from './src/models/OrderJourneySettings.js';
import dotenv from 'dotenv';

dotenv.config();

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URL);
    console.log('Connected to DB');

    const steps = [
      {
        id: 'step_1_' + Date.now(),
        stepNumber: 1,
        title: 'Scan your electricity bill',
        description: 'Upload your latest electricity bill to let our AI analyze your consumption instantly.',
        assignedTo: 'customer',
        allowedRoles: ['company', 'customer'],
        visibleToCustomer: true,
        enabled: true
      },
      {
        id: 'step_2_' + Date.now(),
        stepNumber: 2,
        title: 'Get solar capacity',
        description: 'Receive an accurate recommended solar system size based on your actual energy usage.',
        assignedTo: 'company',
        allowedRoles: ['company'],
        visibleToCustomer: true,
        enabled: true
      },
      {
        id: 'step_3_' + Date.now(),
        stepNumber: 3,
        title: 'Select installation date',
        description: 'Choose a convenient date for your solar project installation.',
        assignedTo: 'customer',
        allowedRoles: ['company', 'customer'],
        visibleToCustomer: true,
        enabled: true
      },
      {
        id: 'step_4_' + Date.now(),
        stepNumber: 4,
        title: 'Get solar installed',
        description: 'Our certified professionals will install your system and get it up and running.',
        assignedTo: 'company',
        allowedRoles: ['company', 'epc-partner'],
        visibleToCustomer: true,
        enabled: true
      }
    ];

    const filter = { country: 'australia' };
    let settings = await OrderJourneySettings.findOne(filter);
    
    if (!settings) {
      settings = new OrderJourneySettings({
        country: 'australia',
        state: 'all',
        district: 'all',
        discom: 'all',
        journeys: [
          {
            projectType: 'residential',
            projectTypeLabel: 'Residential Solar',
            enabled: true,
            steps: steps
          }
        ]
      });
      await settings.save();
      console.log('Created new settings for Australia with steps');
    } else {
      let journeyIndex = settings.journeys.findIndex(j => j.projectType === 'residential');
      if (journeyIndex === -1) {
        settings.journeys.push({
          projectType: 'residential',
          projectTypeLabel: 'Residential Solar',
          enabled: true,
          steps: steps
        });
        console.log('Added residential journey to existing Australia settings');
      } else {
        settings.journeys[journeyIndex].steps = steps;
        console.log('Overwrote residential journey steps with the new 4 steps');
      }
      await settings.save();
    }
    
    console.log('Successfully updated DB');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

run();
