import('./src/config/db.js').then(async (m) => {
    await m.connectDB();
    const Settings = (await import('./src/models/CountryWebsiteSettings.js')).default;
    const auSettings = await Settings.find({ country: 'australia' });
    for (let s of auSettings) {
        if (s.leadFormFields) {
            for (let field of s.leadFormFields) {
                if (field.key === 'monthlyBill') {
                    field.label = 'Quarterly Bill ($) *';
                }
            }
            s.markModified('leadFormFields');
            await s.save();
        }
    }
    console.log("Updated AU DB labels");
    process.exit(0);
}).catch(console.error);
