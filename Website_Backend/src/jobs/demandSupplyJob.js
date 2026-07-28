import cron from 'node-cron';
import DemandSupplySettings from '../models/DemandSupplySettings.js';
import Notification from '../models/Notification.js';
import { calculateAnalytics } from '../controllers/demandSupplyController.js';

const runDemandSupplyAnalysis = async () => {
  try {
    console.log('[Cron Job] Running 4-hourly Demand & Supply Analysis...');
    
    const settings = await DemandSupplySettings.getSingleton();
    const globalAnalytics = await calculateAnalytics({}, settings);

    for (const row of globalAnalytics) {
      // Logic 1: Excess Supply (Low Demand)
      if (row.demandKw > 0 && row.supplyKw > row.demandKw) {
        const msg = `Supply exceeds demand in ${row.district}. Consider lowering limit or pausing allocation. Marketing can be increased to generate demand.`;
        await Notification.create({
          role: 'Admin',
          title: `Demand Low Alert: ${row.district}`,
          message: msg,
          isRead: false
        });
      }
      
      // Logic 2: High Demand (Low Supply)
      if (row.demandKw > row.supplyKw * 1.5) {
        const msg = `Demand is high in ${row.district} (${row.demandKw} KW). Consider increasing supply limit % to allow more EPC capacity.`;
        await Notification.create({
          role: 'Admin',
          title: `Demand High Alert: ${row.district}`,
          message: msg,
          isRead: false
        });
      }
    }

    console.log('[Cron Job] Analysis complete. Notifications generated if necessary.');
  } catch (error) {
    console.error('[Cron Job] Error in demand/supply analysis:', error);
  }
};

// Schedule job to run every 4 hours
const scheduleDemandSupplyJob = () => {
  cron.schedule('0 */4 * * *', runDemandSupplyAnalysis);
  console.log('Scheduled Demand & Supply Job (runs every 4 hours)');
};

export { scheduleDemandSupplyJob, runDemandSupplyAnalysis };
