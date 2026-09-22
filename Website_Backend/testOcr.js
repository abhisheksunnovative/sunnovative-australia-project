import fs from 'fs';
import { parseAuBillText } from './src/utils/Ocrextractor.js';

const text = `
Your AGL energy bill explained
1. Your fuel type
This shows what fuel type your bill is for. 
2. Your account details
to your account, and you should quote it when 
you contact us with any queries. 
3. We’re here to help
If you need to make any changes to your 
personal details, it’s easy to do so at any time 
on My Account or the AGL app. 
For queries about your account, or for tailored 
assistance and advice, visit agl.com.au/help 
or call us. 
If you experience a suspected gas leak or an 
unexpected loss of energy supply to your 
contact number for your distribution company. 
Your distributor is responsible for the reliability 
of gas supply in your area, so you should contact 
. 
4. Clearly see what to pay and when
This shows the amount you need to pay and the 
payment date or when your direct debit is due. 
If you are on Bill Smoothing, you’ll see your 
instalment amount and frequency. 
5. Help and support
Here we’ll provide some help and support 
information for you.
6. Key information about your bill
bill and the supply address.   
7. Choose how to pay your bill
bill including Direct Debit, which takes the hassle 
out of paying your bills and helps ensure you 
always pay your bills on time. 
We’ve also made it easy for you to pay your 
bill online at agl.com.au/payments or on the 
AGL app. 
If you’re paying by cheque, remember to cut 
include it with the cheque when posting. 
present your bill so the barcode can be scanned 
to record your payment. 
8. Find your reference number reference number. You’ll need to quote th
is, 
when 
requeste
d, fo
r some 
payment methods. 
How to pay
Your details
Need help?
Amount due
Due date
AGL Sales Pty Ltd ABN 88 090 538 337
Direct Debit 
Sign up to Direct Debit at 
agl.com.au/payments 
or call 131 245
.
Visa or Mastercard 
Online: agl.com.au/payments 
 :enohP 1300 657 386
PayPal
To pay via PayPal 
vis
it 
agl.com.au/payments 
Hi Sam, 
Here’s your monthly gas bill for supply address: 
12304/123 ‘The sampletown’ Sampletown 
Sample St, SampletownSample Town
Issue date 
5 Apr 2023
Name 
Sam Sample
Account number
123 4567 891X
Meter Identi
fi cation Reference 
Number (MIRN)
560000000XX
eciovnI xaT 
$63.70
23 Apr 2023
Reference number XXXX XXXX XXXX XXXX XXX
X
Support, enquiries or complaints 
agl.com.au/help or 131 245
Faults 
or emergencies
ATCO Gas Australia on 131 352 24 hours a day Energy and Water Ombudsman 
1800 754 004
 :edoC relliB XXX
X
feR
: XXXX XXXX XXXX XXXX XXX
X
Make this payment from your preferred account.
Mail 
Send your cheque along with the 
 :ot noitces siht fo esrever 
AGL Sales Pty Limited 
GPO Box 2220, Sydney 2001
Post Billpay
®
Make a Post Billpay® payment. 
Online: postbillpay.com.au 
 :enohP 131 816. In person at any 
O tsoP 
ffi 1023 :edoC yaplliB .ec 
Gas
Help and support
We’re here 
to help
Questions, feedback or just need 
a bit of help?
Message us in the AGL app or visit 
agl.com.au/help
123
5
4
67
8
Centrepay
For eligibl
e individuals: go to
servic
esaustralia.gov.au/c
entrepa
y
for more information
.
AGL Centrepay CRN: 000-000-000-0

How we’ve worked out your bill
We’ve broken down your charges into a simple structure, so you can better understand how we’ve 
worked out your bill. 
9. How much energy are you using
This chart explains how much gas you have 
used over the past 12 months (unless you’ve 
joined recently). 
11. How we’ve calculated your usage
Here you’ll find whether an actual read or 
an estimation of your usage has been used. 
Sometimes we might need to estimate your 
energy usage, rather than bill you on actual 
usage data. We’ll give you more information 
on how to submit your own meter read, if this 
applies to you. 
To find out more about estimated bills, 
visit agl.com/estimatedbills
12. View your bill period
This information is about important dates 
covered by this bill.
13. Your previous balance and payments
Under the previous balance and payments
section, we’ve listed any payments you’ve made 
and balance brought forward to show how we’ve 
calculated the total charges for this bill. 
10. Your average daily usage
This graph compares how much energy you 
used per day during this period, compared 
to the same time last year. 
To track your usage, visit My Account
or download the AGL app. 
Assistance and support services
Payment assistance: There are a number 
of options available to eligible customers, 
including concessions and the Western 
Australian Government Hardship Utility 
Grants Scheme (HUGS). To fi nd out more, 
visit agl.com.au/concessions or call 
131 245
.
Hearing/speech impaired. 
Call us on 133 677 and quote 
1300 664 358.
Need help to read your bill? 
Visit agl.com.au/languageguides for help 
in your language.
Need an interpreter? 
Talk to someone in your language. 
 Call us on 1300 307 245
. $63.70
23 Apr 2023
Amount due
Due Date
Reference number
XXXX XXXX XXXX XXXX XXXX
Understand your bill 
Gas charges are based on an actual meter reading. 
Bill period: 5 March 2023 to 4 April 2023 (31 Days) 
Average daily usage 
18.58 units
This bill
This time last year
29.73 units
New charges and credits
Previous balance and payments Amount
Previous balance $60.50
Payment $60.50 cr
Balance brought forward $0.00
Usage and supply charges Time of use Units Price Amount
General usage At all times 576 units $0.1335 $76.90
Supply charge Daily 31 days $0.1935 $6.00
Total charges
+ $82.90
Account credit $25.00 cr
Credits
Total credits
- $25.00cr
Total new charges and credits (excluding GST)
= $57.90
Total GST
+ $5.80
Total new charges and credits (including GST)
= $63.70
Amount Due
= $63.70
*All items are subject to GST.
Understand your usage
40
30
20
100
Energy usage
Units 
(daily average)
Apr
23
Feb
23
Dec
22
Oct
22
Nov
22
Jan
23
Mar
23
Aug
22
Sep
22
Jun
22
Jul
22
Apr
22
May
22
14. How we’ve calculated your charges
and credits
The new charges and credits section is 
divided into units and prices for this billing 
period.
Time of use shows the time of day that the 
unit prices apply. 
We list your new charges for your gas supply 
and usage, plus any credits, discounts, 
concessions and adjustments we’ve applied 
to this bill. 
The final total charges amount shown here 
includes the applicable GST. 
15. Get help and support
Here you’ll find information about payment 
assistance and interpreters for getting help 
in your language. 
16. Find your payment amount here
This shows the amount due to pay, the due 
date and your reference number. 
9 10
15 16
14
13
12
11

17. Find your meter read details here 
In this section, you’ll find your meter read details. 
These are used to calculate your energy bill for 
the billing period. 
To track your usage, visit My Account or 
download the AGL app. 
Under this table, you may also find important 
messages about your meter, including your 
next scheduled meter read date, or any issues 
encountered when gaining access to your 
property. 
18. More information for you 
You’ll find plenty of useful information in 
this section, including how to contact us and 
where to find more information about how 
to manage your communications preferences 
and how to be more energy efficient.
For more information about how to read 
your bill, visit agl.com.au/billexplainer
Welcome to your 
new-look bill
You may have noticed your 
bill looks new and improved.
For help understanding your bill, 
visit agl.com.au/newlookbill
Go paperless 
today with eBill
Get eBills 
sent directly 
to your inbox. 
Simply scan the 
QR code or visit 
agl.com.au/ebill
Do you have Life Support 
equipment at home?
It’s important that your details are up to date so we can 
help you prepare for any planned energy interruptions.
Visit agl.com.au/lifesupport or call us on 131 245.
Unpack a great gas plan.
Moving home?
Book your move today at agl.com.au/move
Further information
We’re here for you
Questions, feedback or just need a bit of help? Message 
us anytime in the AGL app or visit agl.com.au/help
Understanding fees and charges
We want you to understand the ins and outs of your bill. 
To fi nd out more about common fees and charges that 
appear on your bill visit agl.com.au/feesandcharges
Are you moving? 
Visit agl.com.au/move to arrange a gas connection at 
your new address.
Want to be more energy effi cient?
For information about incentives to install, improve or 
replace energy savings equipment and appliances in WA 
households and businesses, visit wa.gov.au
Meter details
Meter number Read date Read type Start read End read Heating value Pressure factor Usage unit
654321 5 Apr 23 Actual 3,203 3,263 37.863 1.0086 576
Your next meter read is due between 1 May 23 and 7 May 23. Please ensure easy access to your meter on these days. To 
see how your energy usage is calculated, visit agl.com.au/understandbills
17
18
agl.com.au
`;

const res = parseAuBillText(text, 'australia');
console.log(JSON.stringify(res, null, 2));
