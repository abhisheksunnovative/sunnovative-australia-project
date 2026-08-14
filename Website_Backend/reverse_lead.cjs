const { MongoClient } = require("mongodb");
async function run() {
  const client = new MongoClient("mongodb://structasoftadmin_db_user:w6EuikcNSYs20hlY@ac-yca0bk9-shard-00-00.ui24irh.mongodb.net:27017,ac-yca0bk9-shard-00-01.ui24irh.mongodb.net:27017,ac-yca0bk9-shard-00-02.ui24irh.mongodb.net:27017/?ssl=true&replicaSet=atlas-ah9712-shard-0&authSource=admin&retryWrites=true&w=majority&appName=SUNNOVATIVE-ERP");
  await client.connect();
  const db = client.db("test");
  const lead = await db.collection("leads").findOne({ name: /david mathus/i });
  console.log("Lead:", JSON.stringify(lead, null, 2));
  
  if (lead && lead.convertedProjectId) {
    const po = await db.collection("projectorders").findOne({ _id: lead.convertedProjectId });
    console.log("ProjectOrder:", JSON.stringify(po, null, 2));
    
    // delete PO
    await db.collection("projectorders").deleteOne({ _id: lead.convertedProjectId });
    console.log("Deleted Project Order");
    
    // reset Lead
    await db.collection("leads").updateOne({ _id: lead._id }, {
      $set: { status: "New" },
      $unset: { convertedProjectId: "", isInstallDateFixed: "", preferredInstallDate: "" }
    });
    console.log("Lead reversed to New");
  } else {
    console.log("No converted project found for lead");
  }
  
  await client.close();
}
run().catch(console.dir);
