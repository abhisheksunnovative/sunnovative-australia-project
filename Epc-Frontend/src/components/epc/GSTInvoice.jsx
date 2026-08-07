import React from 'react';

const GSTInvoice = ({ project, epc }) => {
  // Australian GST is 10%
  const subtotal = (project.totalProjectCost || 0) / 1.1;
  const gstAmount = (project.totalProjectCost || 0) - subtotal;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="bg-white p-8 max-w-4xl mx-auto shadow-sm border border-gray-200">
      <div className="flex justify-between items-start border-b pb-6 mb-6">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">TAX INVOICE</h1>
          <p className="text-gray-500 mt-1 font-medium">Invoice #{project.orderNumber}</p>
        </div>
        <div className="text-right">
          <h2 className="text-xl font-bold text-gray-800">{epc?.companyName}</h2>
          <p className="text-gray-600 text-sm mt-1">{epc?.address}</p>
          <p className="text-gray-600 text-sm">{epc?.city}, {epc?.state} {epc?.pincode}</p>
          <p className="text-gray-600 text-sm font-semibold mt-2">ABN: {epc?.kycDocuments?.abn || 'Not Provided'}</p>
        </div>
      </div>

      <div className="flex justify-between mb-8">
        <div>
          <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Bill To:</p>
          <p className="text-gray-800 font-bold">{project.customerName}</p>
          <p className="text-gray-600 text-sm">{project.location?.address}</p>
          <p className="text-gray-600 text-sm">{project.location?.city}, {project.location?.state} {project.location?.pincode}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Date Issued:</p>
          <p className="text-gray-800 font-bold">{new Date().toLocaleDateString('en-AU')}</p>
        </div>
      </div>

      <table className="w-full text-left mb-8">
        <thead>
          <tr className="border-b-2 border-gray-800">
            <th className="py-2 text-sm font-bold text-gray-800 uppercase tracking-wider">Description</th>
            <th className="py-2 text-sm font-bold text-gray-800 uppercase tracking-wider text-right">Amount (inc. GST)</th>
          </tr>
        </thead>
        <tbody>
          <tr className="border-b border-gray-200">
            <td className="py-4 text-gray-700">
              <p className="font-bold">Solar System Installation - {project.systemSizeKW}kW</p>
              <p className="text-sm text-gray-500 mt-1">Includes panels, inverter, and full installation at the property.</p>
              {project.estimatedSubsidy > 0 && (
                 <p className="text-sm text-green-600 font-medium mt-1">
                   * Includes point-of-sale STC discount of ${project.estimatedSubsidy.toLocaleString()}
                 </p>
              )}
            </td>
            <td className="py-4 font-bold text-gray-900 text-right">${project.totalProjectCost?.toLocaleString()}</td>
          </tr>
        </tbody>
      </table>

      <div className="flex justify-end mb-8">
        <div className="w-64">
          <div className="flex justify-between py-1 text-sm text-gray-600">
            <span>Subtotal (ex GST)</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between py-1 text-sm text-gray-600">
            <span>GST (10%)</span>
            <span>${gstAmount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between py-3 border-t-2 border-gray-800 mt-2">
            <span className="font-black text-gray-900">Total Due</span>
            <span className="font-black text-gray-900">${project.totalProjectCost?.toLocaleString()}</span>
          </div>
        </div>
      </div>

      <div className="border-t pt-6 text-sm text-gray-500 text-center">
        <p>Thank you for choosing {epc?.companyName} for your solar installation.</p>
        <p>Payment is due within 7 days. Please use Invoice #{project.orderNumber} as reference.</p>
      </div>

      <div className="mt-8 text-center print:hidden">
        <button onClick={handlePrint} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg transition">
           Download / Print PDF
        </button>
      </div>
    </div>
  );
};

export default GSTInvoice;
