export const validateExtraction = (extractedData) => {
  let status = 'PASS';
  let messages = [];
  let baseConfidence = 0.90;

  // V001: current_reading - previous_reading ~ units_consumed
  if (extractedData.current_reading && extractedData.previous_reading && extractedData.units_consumed) {
    const calcUnits = parseFloat(extractedData.current_reading) - parseFloat(extractedData.previous_reading);
    if (Math.abs(calcUnits - parseFloat(extractedData.units_consumed)) > 2) {
      status = 'REVIEW';
      baseConfidence = 0.70;
      messages.push('V001 Failed: current - previous != units_consumed');
    }
  }

  // V003: total_bill reconciliation
  if (extractedData.energy_charge && extractedData.fixed_charge && extractedData.total_bill) {
    const sum = parseFloat(extractedData.energy_charge) + parseFloat(extractedData.fixed_charge) + parseFloat(extractedData.electricity_duty || 0);
    if (Math.abs(sum - parseFloat(extractedData.total_bill)) > 50) {
      status = 'REVIEW';
      baseConfidence = 0.70;
      messages.push('V003 Failed: charge components do not sum up to total_bill');
    }
  }

  return { status, confidence: baseConfidence, messages };
};
