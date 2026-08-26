const fs = require('fs');

let bdeCtrl = fs.readFileSync('../Website_Backend/src/controllers/bdeController.js', 'utf8');
if (!bdeCtrl.includes('req.body.nextFollowUp')) {
  bdeCtrl = bdeCtrl.replace(
    'if (notes) lead.notes = notes;',
    'if (notes) lead.notes = notes;\n    if (req.body.nextFollowUp) lead.nextFollowUp = new Date(req.body.nextFollowUp);'
  );
  fs.writeFileSync('../Website_Backend/src/controllers/bdeController.js', bdeCtrl);
}

let leadCtrl = fs.readFileSync('../Website_Backend/src/controllers/leadController.js', 'utf8');
// In convertLeadToProject, wait, convertLeadToProject converts it. The prospect is already booked?
// "Wait! Australia converts it directly, there is no token! "jin country me toke nhi bahra jata hai unme ye folow up amrk krne ka otion and filtr mt show kro"
// So Australia doesn't even need nextFollowUp. It converts straight to ProjectOrder.
// So I don't need to patch leadController for Australia's conversion! Only bdeController for India!

console.log("Patched bdeController");
