import mongoose from 'mongoose';

async function fixDB() {
  await mongoose.connect('mongodb://127.0.0.1:27017/sunnovative');
  const db = mongoose.connection.db;
  
  const res1 = await db.collection('orderjourneysettings').updateMany(
    {'steps.title': 'Site Survey'}, 
    { $set: { 'steps.$[elem].assignedTo': 'epc-partner' } }, 
    { arrayFilters: [{'elem.title': 'Site Survey'}]}
  );
  const res2 = await db.collection('orderjourneysettings').updateMany(
    {'steps.title': 'Installation'}, 
    { $set: { 'steps.$[elem].assignedTo': 'epc-partner' } }, 
    { arrayFilters: [{'elem.title': 'Installation'}]}
  );
  const res3 = await db.collection('orderjourneysettings').updateMany(
    {'steps.title': 'Commissioning'}, 
    { $set: { 'steps.$[elem].assignedTo': 'epc-partner' } }, 
    { arrayFilters: [{'elem.title': 'Commissioning'}]}
  );

  const p1 = await db.collection('projectorders').updateMany(
    {'steps.title': 'Site Survey'}, 
    { $set: { 'steps.$[elem].assignedTo': 'epc-partner' } }, 
    { arrayFilters: [{'elem.title': 'Site Survey'}]}
  );
  const p2 = await db.collection('projectorders').updateMany(
    {'steps.title': 'Installation'}, 
    { $set: { 'steps.$[elem].assignedTo': 'epc-partner' } }, 
    { arrayFilters: [{'elem.title': 'Installation'}]}
  );
  const p3 = await db.collection('projectorders').updateMany(
    {'steps.title': 'Commissioning'}, 
    { $set: { 'steps.$[elem].assignedTo': 'epc-partner' } }, 
    { arrayFilters: [{'elem.title': 'Commissioning'}]}
  );

  console.log("Updated journey settings:", res1.modifiedCount, res2.modifiedCount, res3.modifiedCount);
  console.log("Updated project orders:", p1.modifiedCount, p2.modifiedCount, p3.modifiedCount);
  
  process.exit(0);
}

fixDB();
