import EpcEnquiry from '../models/EpcEnquiry.js';
import { ProjectOrder } from '../models/ProjectModel.js';

export const openEnquiryForEpcs = async (orderId) => {
    const order = await ProjectOrder.findById(orderId);
    if (!order) return { success: false, message: 'Order not found' };

    let enquiry = await EpcEnquiry.findOne({ orderNumber: order.orderNumber });
    if (!enquiry) return { success: false, message: 'Enquiry not found for this order' };

    const hasInstallDate = !!order.preferredInstallDate;
    const isTokenPaid = order.paymentStatus === 'paid' || order.paymentStatus === 'not_required';

    if (hasInstallDate && isTokenPaid) {
        if (enquiry.status !== 'Open For EPC' && enquiry.status !== 'Bid Running' && enquiry.status !== 'EPC Accepted') {
            enquiry.status = 'Open For EPC';
            enquiry.preferredInstallDate = order.preferredInstallDate;
            await enquiry.save();
        }
        return { success: true, status: 'Open For EPC', message: 'Enquiry is now Open For EPC' };
    } else {
        if (enquiry.status === 'Open For EPC') {
            enquiry.status = 'Pending Info';
            await enquiry.save();
        }
        return { success: false, status: 'Pending Info', message: 'Missing requirements' };
    }
};
