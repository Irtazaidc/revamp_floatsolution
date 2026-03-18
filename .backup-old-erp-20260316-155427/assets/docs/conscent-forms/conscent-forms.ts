export const ConscentForms = {
    covid: {
        general: `<div class="page">
            <style>
                table {
                    font-size: 13px;
                }
                .fw-bold {
                    font-weight: bold;
                }
                .full-width-flex {
                    display: flex;
                    width: 100%;
                }
                .remaining-width {
                    flex-grow: 100; border-bottom: 1px dashed; margin: 0 10px;
                }
                .cnic-table{
                    width: 74%; border-collapse: collapse;
                }
                .cnic-table tbody tr {
                    height: 25px;
                }
                .cnic-table tbody tr td {
                    border: 1px solid #000; margin: 0; padding: 0; text-align: center; width: 6%;
                }

                .clinical-info {
                    display: flex; flex-direction: row; width: 100%; flex-wrap: wrap;
                }
                .clinical-info .item {
                    margin: 2px 9px;
                }
            </style>


            <p style='margin-top:0in;margin-right:2.0pt;margin-bottom:.0001pt;margin-left:.05pt;text-indent:-.15pt;font-size:13px;font-family:"Calibri",sans-serif;text-align:center;line-height:98%;'><strong><span style="font-size:17px;line-height:98%;">Islamabad Diagnostic Centre (Pvt Ltd)</span></strong></p>
            <p style='margin-top:0in;margin-right:2.0pt;margin-bottom:.0001pt;margin-left:.05pt;text-indent:-.15pt;font-size:13px;font-family:"Calibri",sans-serif;text-align:center;line-height:98%;'><strong><span style="font-size:17px;line-height:98%;">Consent &amp; Case report form for Novel Coronavirus COVID-19</span></strong></p>
            <p style='margin-top:0in;margin-right:0in;margin-bottom:.0001pt;margin-left:0in;text-indent:-.1pt;font-size:13px;font-family:"Calibri",sans-serif;'><span style="font-size:16px;">&nbsp;</span></p>
            <p style='margin-top:0in;margin-right:0in;margin-bottom:12.0pt;margin-left:.05pt;text-indent:-.15pt;font-size:13px;font-family:"Calibri",sans-serif;'><strong><u><span style="font-size:17px;">Section 1. Patient information</span></u></strong></p>
            <table class="table" style="width: 100%;">
                <tbody>
                    <tr>
                        <td width="40%"><span class="full-width-flex"><span>Name: </span><span class="name_value remaining-width fw-bold">[PATIENT_NAME]</span></span></td>
                        <td width="15%"><span class="full-width-flex"><span>Age: </span><span class="age_value remaining-width fw-bold">[PATIENT_AGE]</span></span></td>
                        <td width="15%"><span class="full-width-flex"><span>Sex: </span><span class="sex_value remaining-width fw-bold">[PATIENT_GENDER]</span></span></td>
                        <td width="30%"><span class="full-width-flex"><span>Contect: </span><span class="contact_value remaining-width fw-bold">[PATIENT_MOBILE]</span></span></td>
                    </tr>
                </tbody>
            </table>
            <table class="table" style="width: 100%;">
                <tbody>
                    <tr>
                        <td width="70%"><span class="full-width-flex"><span>Place of residence/address: </span><span class="pat_address_value remaining-width fw-bold">[PATIENT_ADDRESS]</span></span></td>
                        <td width="30%"><span class="full-width-flex"><span>Date of visit: </span><span class="visit_date_value remaining-width fw-bold">[PATIENT_VISIT_DATE]</span></span></td>
                    </tr>
                </tbody>
            </table>

            <table class="table" style="width: 100%;">
                <tbody>
                    <tr>
                        <td width="20%"><span class="full-width-flex"><span>Type of Visit: </span><span class="visit_type_value remaining-width"></span></span></td>
                        <td width="20%"><span>First visit: </span><span class="first_visit_value"><input type="checkbox"></input></span></td>
                        <td width="20%"><span>Follow up visit: </span><span class="followup_visit_value"><input type="checkbox"></input></span></td>
                        <td width="40%"><span class="full-width-flex"><span>Results of previous test if done: </span><span class="prev_result_value remaining-width"></span></span></td>
                    </tr>
                </tbody>
            </table>

            <table class="table cnic-table">
                <tbody>
                    <tr>
                        <td><span class="cnic_no_value fw-bold">[PATIENT_CNIC_0]</span></td>
                        <td><span class="cnic_no_value fw-bold">[PATIENT_CNIC_1]</span></td>
                        <td><span class="cnic_no_value fw-bold">[PATIENT_CNIC_2]</span></td>
                        <td><span class="cnic_no_value fw-bold">[PATIENT_CNIC_3]</span></td>
                        <td><span class="cnic_no_value fw-bold">[PATIENT_CNIC_4]</span></td>
                        <td><span class="cnic_no_value fw-bold">-</span></td>
                        <td><span class="cnic_no_value fw-bold">[PATIENT_CNIC_5]</span></td>
                        <td><span class="cnic_no_value fw-bold">[PATIENT_CNIC_6]</span></td>
                        <td><span class="cnic_no_value fw-bold">[PATIENT_CNIC_7]</span></td>
                        <td><span class="cnic_no_value fw-bold">[PATIENT_CNIC_8]</span></td>
                        <td><span class="cnic_no_value fw-bold">[PATIENT_CNIC_9]</span></td>
                        <td><span class="cnic_no_value fw-bold">[PATIENT_CNIC_10]</span></td>
                        <td><span class="cnic_no_value fw-bold">[PATIENT_CNIC_11]</span></td>
                        <td><span class="cnic_no_value fw-bold">-</span></td>
                        <td><span class="cnic_no_value fw-bold">[PATIENT_CNIC_12]</span></td>
                    </tr>
                </tbody>
            </table>


            <table style="width: 100%;">
                <tbody>
                    <tr>
                        <td width="50%"><span class="full-width-flex"> <span>Passport Number: </span><span class="pp_no remaining-width fw-bold">[PATIENT_PPNO]</span></span></td>
                        <td width="50%"><span class="full-width-flex"> <span>Booking reference No: </span><span class="booking_ref_no remaining-width fw-bold">[PATIENT_BOOKING_REF_NO]</span></span></td>
                    </tr>
                </tbody>
            </table>

            <p style="margin-top:0in;margin-right:0in;margin-bottom:.0001pt;margin-left:0in;text-indent:-.1pt;font-size:13px;font-family:&quot;Calibri&quot;,sans-serif;"><span style="font-size:16px;">&nbsp;</span></p>

            <p style='margin-top:0in;margin-right:0in;margin-bottom:12.0pt;margin-left:.05pt;text-indent:-.15pt;font-size:13px;font-family:"Calibri",sans-serif;'><strong><u><span style="font-size:17px;">Section 2. Clinical Information</span></u></strong></p>

            <div style="padding-left: 10px;">Patient’s signs and symptoms:  If present mark the squares with (✔)</div>

            <div class="clinical-info">
                <div class="item">
                    Dry Cough <input type="checkbox">
                </div>
                <div class="item">
                    Fever <input type="checkbox">
                </div>
                <div class="item">
                    Tredness <input type="checkbox">
                </div>
                <div class="item">
                    Chest pain <input type="checkbox">
                </div>
                <div class="item">
                    Sore throat <input type="checkbox">
                </div>
                <div class="item">
                    Runny nose <input type="checkbox">
                </div>
                <div class="item">
                    Body aches <input type="checkbox">
                </div>
                <div class="item">
                    Loss of smell <input type="checkbox">
                </div>
                <div class="item">
                    Loss of taste <input type="checkbox">
                </div>
                <div class="item">
                    Temperature ________F
                </div>
            </div>

            <p>&nbsp;</p>
            <p style='margin-top:0in;margin-right:0in;margin-bottom:12.0pt;margin-left:.05pt;text-indent:-.15pt;font-size:13px;font-family:"Calibri",sans-serif;'><strong><u><span style="font-size:17px;">Section 3: Exposure and travel information</span></u></strong></p>
            <p style='margin-top:0in;margin-right:0in;margin-bottom:.0001pt;margin-left:0in;text-indent:-.1pt;font-size:13px;font-family:"Calibri",sans-serif;line-height:150%;'>&nbsp;Travel history during 14 days prior to onset of symptoms: _____________________________________________________</p>

            <table style="width: 100%;">
                <tbody>
                    <tr>
                    <td width="40%">Contact with a suspectedor confirmed case of COVID-19:</td>
                    <td>Yes <input type="checkbox" /></span></td>
                    <td>No <input type="checkbox" /></span></td>
                </tr>
                <tr>
                    <td width="40%">Has the patient had any direct or indirect:</td>
                    <td>Yes <input type="checkbox" /></span></td>
                    <td>No <input type="checkbox" /></span></td>
                </tr>
                </tbody>
            </table>

            <p>&nbsp;</p>


            <p style='margin-top:0in;margin-right:0in;margin-bottom:12.0pt;margin-left:.05pt;text-indent:-.15pt;font-size:13px;font-family:"Calibri",sans-serif;'><strong><u><span style="font-size:17px;">Section 4: Patient information and consent</span></u></strong></p>
            <ol style="list-style-type: decimal;margin-left:10px;padding-left:10px;">
                <li><span style='font-family:"Quattrocento Sans";'>I __________________________________________ confirm that I have verified that the data provided above is correct to the best of my knowledge.</span></li>
                <li><span style='font-family:"Quattrocento Sans";'>That I will cooperate with Islamabad Diagnostic Centre (Pvt Ltd) for the test to the best of my ability.</span></li>
                <li><span style='font-family:"Quattrocento Sans";'>That I have completely understood the procedure guidelines provided in Section4, and I understand the limitations of this procedure as mentioned above and also that it is a notifyable disease.</span></li>
                <li><span style='font-family:"Quattrocento Sans";'>That I consent and fully agree to all undertakings given in section 4.</span></li>
                <li><span style='font-family:"Quattrocento Sans";'>False positive and false negative COVID-19 PCR test can be because of certain variables including post sample exposure, travel time, technology and technique limitations. In such case IDC does not bear any responsibility and I surrender my authority and right to claim compensation/damages (civil/criminal) for any result.</span></li>
                <li><span style="font-family:Arial;">Negative patients can become positive upon arrival in the destination country as a result of exposure during the time interval between sampling and arrival at the destination.</span></li>
                <li>I will not hold IDC responsible for any issues faced by meanwhile travelling due to provision of incomplete information required by respective airlines. Such information may contain but is not limited to passport number, ticket number, date of departure etc.</li>
                <li>Test report validity time varies from airline to airline. I fully understand that it is the sole responsibility of the passenger to ensure he/she gets the test done within the acceptable time window of his/her respective airline. Airline and IDC will not be responsible for any travel difficulty arising due to report expiry.</li>
            </ol>
            <p style='margin-top:0in;margin-right:0in;margin-bottom:.0001pt;margin-left:0in;text-indent:-.1pt;font-size:13px;font-family:"Calibri",sans-serif;'><span style="font-size:16px;">&nbsp;</span></p>
            <p style='margin-top:0in;margin-right:0in;margin-bottom:.0001pt;margin-left:0in;text-indent:-.1pt;font-size:13px;font-family:"Calibri",sans-serif;'><span style="font-size:16px;">&nbsp;</span></p>
            <p style='margin-top:0in;margin-right:0in;margin-bottom:.0001pt;margin-left:0in;text-indent:-.1pt;font-size:13px;font-family:"Calibri",sans-serif;'><span style="font-size:16px;">&nbsp;</span></p>
            <p style='margin-top:0in;margin-right:0in;margin-bottom:.0001pt;margin-left:0in;text-indent:-.1pt;font-size:13px;font-family:"Calibri",sans-serif;'><span style="font-size:16px;">&nbsp;____________________________________________</span></p>
            <p style='margin-top:0in;margin-right:0in;margin-bottom:.0001pt;margin-left:0in;text-indent:-.1pt;font-size:13px;font-family:"Calibri",sans-serif;'><span style="font-size:16px;">Patient Name and Signature</span></p>
        </div>`,
        airlinesOath: `<div class="page"><p style='margin-top:0in;margin-right:0in;margin-bottom:8.0pt;margin-left:0in;line-height:107%;font-size:15px;font-family:"Calibri",sans-serif;text-align:justify;'><strong><span style="font-size:24px;line-height:107%;">Dear Passenger,</span></strong></p>
        <p style='margin-top:0in;margin-right:0in;margin-bottom:8.0pt;margin-left:0in;line-height:107%;font-size:15px;font-family:"Calibri",sans-serif;text-align:justify;'><span style="font-size:19px;line-height:107%;">As the airspace has re-opened after lockdowns, and airlines/governments have made Covid-19 testing mandatory, please be aware that the new airplane boarding protocols are in their infancy at the moment and hence you may face difficulties and delays. All airlines and IDC are working to smoothen the boarding process as quickly as possible. We request you to please cooperate with your respective airlines staff.</span></p>
        <p style='margin-top:0in;margin-right:0in;margin-bottom:8.0pt;margin-left:0in;line-height:107%;font-size:15px;font-family:"Calibri",sans-serif;text-align:justify;'><span style="font-size:19px;line-height:107%;">In view of the above Islamabad Diagnostic Centre Pvt. Ltd. will not be liable for any difficulties faced while travelling including not being allowed to board the aircraft by the airline.</span></p>
        <p style='margin-top:0in;margin-right:0in;margin-bottom:8.0pt;margin-left:0in;line-height:107%;font-size:15px;font-family:"Calibri",sans-serif;text-align:justify;'><span style="font-size:19px;line-height:107%;">I the undersigned have read, understood and agree to the above.</span></p>
        <p dir="RTL" style='margin-top:0in;margin-right:0in;margin-bottom:8.0pt;margin-left:0in;line-height:107%;font-size:15px;font-family:"Calibri",sans-serif;text-align:right;'><strong><span dir="LTR" style="font-size:29px;line-height:107%;">&nbsp;</span></strong></p>
        <p dir="RTL" style='margin-top:0in;margin-right:0in;margin-bottom:8.0pt;margin-left:0in;line-height:107%;font-size:15px;font-family:"Calibri",sans-serif;text-align:right;'><strong><span style='font-size:24px;line-height:107%;font-family:"Jameel Noori Nastaleeq";'>محترم مسافر،</span></strong></p>
        <p dir="RTL" style='margin-top:0in;margin-right:0in;margin-bottom:8.0pt;margin-left:0in;line-height:107%;font-size:15px;font-family:"Calibri",sans-serif;text-align:justify;'><span style='font-size:20px;line-height:107%;font-family:"Jameel Noori Nastaleeq";'>کورونا کی وباء کے بعد ہوائی سفر دوبارہ شروع ہو رہا ہے۔ اور دنیا کے مختلف ممالک اور ایئرلائنزنے ہوائی سفر سے قبل</span><span dir="LTR" style='font-size:20px;line-height:107%;font-family:"Jameel Noori Nastaleeq";'><br>&nbsp;</span><span style='font-size:20px;line-height:107%;font-family:"Jameel Noori Nastaleeq";'>&nbsp;کویڈ &ndash; 19 کے ٹیسٹ لازمی قرار دے دئیے ہیں۔ آپ کو آگاہ کرنا ضروری ہے کہ نئے پروٹوکولز اور ہوائی سفر کے ضابطے ابھی ابتدائی مراحل میں ہیں، جن کی وجہ سے آپ کوبورڈنگ میں تاخیر اورمشکلات کا سامنا کرنا پڑ سکتا ہے۔ فضائی آپریشن میں شامل تمام ایئر</span><span style='font-size:20px;line-height:107%;font-family:"Jameel Noori Nastaleeq";'>لائنز</span><span style='font-size:20px;line-height:107%;font-family:"Jameel Noori Nastaleeq";'>اور&nbsp;</span><span dir="LTR" style='font-size:20px;line-height:107%;font-family:"Jameel Noori Nastaleeq";'>IDC</span><span style='font-size:20px;line-height:107%;font-family:"Jameel Noori Nastaleeq";'>،بور ڈنگ کے عمل کو سہل اور تیز بنانے کیلئے کوشاں ہیں۔ ہماری آپ سے درخواست ہے کہ براہ کرم اپنے متعلقہ ایئرلائنز کے عملے کے ساتھ تعاون کریں۔</span></p>
        <p dir="RTL" style='margin-top:0in;margin-right:0in;margin-bottom:8.0pt;margin-left:0in;line-height:107%;font-size:15px;font-family:"Calibri",sans-serif;text-align:justify;'><span style='font-size:20px;line-height:107%;font-family:"Jameel Noori Nastaleeq";'>مذکورہ بالا &nbsp; صورتحال کے پیش نظر اسلام آباد ڈائگناسٹک سنٹر سفر کے دوران درپیش کسی بھی مشکلات کا ذمہ دار نہیں ہوگا۔ اور اس میں کسی بھی ائیرلائنز کی جانب سے ہوائی جہاز میں سوار ہونے کی اجازت نہ دینا بھی شامل ہے۔</span></p>
        <p style='margin-top:0in;margin-right:0in;margin-bottom:8.0pt;margin-left:0in;line-height:107%;font-size:15px;font-family:"Calibri",sans-serif;text-align:justify;'><span style='font-size:24px;line-height:107%;font-family:"Jameel Noori Nastaleeq";'>&nbsp;</span></p>
        <div style='margin-top:0in;margin-right:0in;margin-bottom:8.0pt;margin-left:0in;line-height:107%;font-size:15px;font-family:"Calibri",sans-serif;border:none;border-bottom:solid windowtext 1.5pt;padding:0in 0in 1.0pt 0in;'>
            <p style='margin-top:0in;margin-right:0in;margin-bottom:8.0pt;margin-left:0in;line-height:107%;font-size:15px;font-family:"Calibri",sans-serif;text-align:justify;border:none;padding:0in;'><strong><span style="font-size:21px;line-height:107%;">&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;&nbsp;</span></strong></p>
        </div>
        <p style='margin-top:0in;margin-right:0in;margin-bottom:8.0pt;margin-left:0in;line-height:107%;font-size:15px;font-family:"Calibri",sans-serif;text-align:justify;'><strong><span style="font-size:24px;line-height:107%;">Name and signature &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;</span></strong><strong><span dir="RTL" style='font-size:24px;line-height:107%;font-family:"Jameel Noori Nastaleeq";'>نام اور دستخط</span></strong></p></div>`,
        // EK | Emirates Airlines 
        '809': `<div class="page">
                    <style>
                        table {
                            width: 100%;
                            border-spacing:0;
                            border-collapse: collapse;
                        }
                        table.bordered tbody tr td {
                            border: 1px solid #aaa;
                        }
                        table tbody tr td.col-1 {
                            width: 35%;
                        }
                    </style>

                    <div><br></div>
                    <p><strong><span style="font-size:17px;color:red;">STRICTLY CONFIDENTIAL</span></strong></p>
                    
                    <h1 style="text-align: center;">PASSENGER CONSENT FORM</h1>
                    <h2>For Emirates Airline to be allowed access to passenger’s medical record.</h2>
                    
                    <table class="bordered">
                        <tbody>
                            <tr>
                                <td class="col-1">Name</td>
                                <td class="col-2">[PATIENT_NAME]</td>
                            </tr>
                            <tr>
                                <td class="col-1">Date of Birth</td>
                                <td class="col-2">[PATIENT_DOB]</td>
                            </tr>
                            <tr>
                                <td class="col-1">Nationality</td>
                                <td class="col-2">[PATIENT_NATIONALITY]</td>
                            </tr>
                            <tr>
                                <td class="col-1">Passport Number</td>
                                <td class="col-2">[PATIENT_PPNO]</td>
                            </tr>
                            <tr>
                                <td class="col-1">Flight Number</td>
                                <td class="col-2">[PATIENT_FLIGHT_NO]</td>
                            </tr>
                            <tr>
                                <td class="col-1">Flight Date</td>
                                <td class="col-2">[PATIENT_FLIGHT_DATE]</td>
                            </tr>
                            <tr>
                                <td class="col-1">Booking Reference</td>
                                <td class="col-2">[PATIENT_BOOKING_REF_NO]</td>
                            </tr>
                            <tr>
                                <td class="col-1">Passenger email address</td>
                                <td class="col-2">[PATIENT_EMAIL]</td>
                            </tr>
                            <tr>
                                <td class="col-1">Passenger Contact Number</td>
                                <td class="col-2">[PATIENT_MOBILE]</td>
                            </tr>
                            <tr>
                                <td class="col-1">Sample Collection Location</td>
                                <td class="col-2">[PATIENT_SAMPLE_COLLECTION_LOC]</td>
                            </tr>
                            <tr>
                                <td class="col-1">Email Address</td>
                                <td class="col-2">[PATIENT_EMAIL]</td>
                            </tr>
                            <!--
                            <tr>
                                <td class="col-1">CNIC</td>
                                <td class="col-2">[PATIENT_CNIC]</td>
                            </tr>
                            -->
                        </tbody>
                    </table>
                    <br><br>
                    <h3>CONSENT:</h3>
                    <p>I have read this form and fully understand the contents of it. I understand that filling in and signing this form gives you permission to give copies of my PCR – COVID 19 reports to Emirates Airline for travelling purpose.</p>
                    
                    <br><br>
                    <h3>TERMS AND CONDITIONS:</h3>
                    <ul style="list-style-type: auto;">
                        <li><span style="font-size:13px;">Passengers must take a PCR test up to 4 days prior to their date of travel (within 96hours).</span></li>
                        <li><span style="font-size:13px;">Emirates shall not be liable for the outcome of the test.</span></li>
                        <li><span style="font-size:13px;">Emirates shall not be liable for any damages, claims or other consequences including expenses arising out of any loss, temporary misplacement, delay or damage to the test results once handed over to the passenger.</span></li>
                    </ul>

                    <br><br><br><br>
                    <p style="margin:0in;margin-bottom:.0001pt;font-size:15px;font-family:&quot;Carlito&quot;,sans-serif;margin-left:5.0pt;text-align:justify;"><strong>Passenger Signature &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;Date</strong></p></body>
                </div>`,
        // ETIHAD | Etihad Airways
        '815': `<div class="page">
                    <style>
                        table {
                            font-size: 13px;
                        }
                        .fw-bold {
                            font-weight: bold;
                        }
                        .full-width-flex {
                            display: flex;
                            width: 100%;
                        }
                        .remaining-width {
                            flex-grow: 100; border-bottom: 1px dashed; margin: 0 10px;
                        }
                        .cnic-table{
                            width: 74%; border-collapse: collapse;
                        }
                        .cnic-table tbody tr {
                            height: 25px;
                        }
                        .cnic-table tbody tr td {
                            border: 1px solid #000; margin: 0; padding: 0; text-align: center; width: 6%;
                        }

                        .clinical-info {
                            display: flex; flex-direction: row; width: 100%; flex-wrap: wrap;
                        }
                        .clinical-info .item {
                            margin: 2px 9px;
                        }
                    </style>


                    <p style='margin-top:0in;margin-right:2.0pt;margin-bottom:.0001pt;margin-left:.05pt;text-indent:-.15pt;font-size:13px;font-family:"Calibri",sans-serif;text-align:center;line-height:98%;'><strong><span style="font-size:17px;line-height:98%;">Islamabad Diagnostic Centre (Pvt Ltd)</span></strong></p>
                    <p style='margin-top:0in;margin-right:2.0pt;margin-bottom:.0001pt;margin-left:.05pt;text-indent:-.15pt;font-size:13px;font-family:"Calibri",sans-serif;text-align:center;line-height:98%;'><strong><span style="font-size:17px;line-height:98%;">Consent &amp; Case report form for Novel Coronavirus COVID-19</span></strong></p>
                    <p style='margin-top:0in;margin-right:0in;margin-bottom:.0001pt;margin-left:0in;text-indent:-.1pt;font-size:13px;font-family:"Calibri",sans-serif;'><span style="font-size:16px;">&nbsp;</span></p>
                    <p style='margin-top:0in;margin-right:0in;margin-bottom:12.0pt;margin-left:.05pt;text-indent:-.15pt;font-size:13px;font-family:"Calibri",sans-serif;'><strong><u><span style="font-size:17px;">Section 1. Patient information</span></u></strong></p>
                    <table class="table" style="width: 100%;">
                        <tbody>
                            <tr>
                                <td width="40%"><span class="full-width-flex"><span>Name: </span><span class="name_value remaining-width fw-bold">[PATIENT_NAME]</span></span></td>
                                <td width="15%"><span class="full-width-flex"><span>Age: </span><span class="age_value remaining-width fw-bold">[PATIENT_AGE]</span></span></td>
                                <td width="15%"><span class="full-width-flex"><span>Sex: </span><span class="sex_value remaining-width fw-bold">[PATIENT_GENDER]</span></span></td>
                                <td width="30%"><span class="full-width-flex"><span>Contect: </span><span class="contact_value remaining-width fw-bold">[PATIENT_MOBILE]</span></span></td>
                            </tr>
                        </tbody>
                    </table>
                    <table class="table" style="width: 100%;">
                        <tbody>
                            <tr>
                                <td width="70%"><span class="full-width-flex"><span>Place of residence/address: </span><span class="pat_address_value remaining-width fw-bold">[PATIENT_ADDRESS]</span></span></td>
                                <td width="30%"><span class="full-width-flex"><span>Date of visit: </span><span class="visit_date_value remaining-width fw-bold">[PATIENT_VISIT_DATE]</span></span></td>
                            </tr>
                        </tbody>
                    </table>

                    <table class="table" style="width: 100%;">
                        <tbody>
                            <tr>
                                <td width="20%"><span class="full-width-flex"><span>Type of Visit: </span><span class="visit_type_value remaining-width"></span></span></td>
                                <td width="20%"><span>First visit: </span><span class="first_visit_value"><input type="checkbox"></input></span></td>
                                <td width="20%"><span>Follow up visit: </span><span class="followup_visit_value"><input type="checkbox"></input></span></td>
                                <td width="40%"><span class="full-width-flex"><span>Results of previous test if done: </span><span class="prev_result_value remaining-width"></span></span></td>
                            </tr>
                        </tbody>
                    </table>

                    <table class="table cnic-table">
                        <tbody>
                            <tr>
                                <td><span class="cnic_no_value fw-bold">[PATIENT_CNIC_0]</span></td>
                                <td><span class="cnic_no_value fw-bold">[PATIENT_CNIC_1]</span></td>
                                <td><span class="cnic_no_value fw-bold">[PATIENT_CNIC_2]</span></td>
                                <td><span class="cnic_no_value fw-bold">[PATIENT_CNIC_3]</span></td>
                                <td><span class="cnic_no_value fw-bold">[PATIENT_CNIC_4]</span></td>
                                <td><span class="cnic_no_value fw-bold">-</span></td>
                                <td><span class="cnic_no_value fw-bold">[PATIENT_CNIC_5]</span></td>
                                <td><span class="cnic_no_value fw-bold">[PATIENT_CNIC_6]</span></td>
                                <td><span class="cnic_no_value fw-bold">[PATIENT_CNIC_7]</span></td>
                                <td><span class="cnic_no_value fw-bold">[PATIENT_CNIC_8]</span></td>
                                <td><span class="cnic_no_value fw-bold">[PATIENT_CNIC_9]</span></td>
                                <td><span class="cnic_no_value fw-bold">[PATIENT_CNIC_10]</span></td>
                                <td><span class="cnic_no_value fw-bold">[PATIENT_CNIC_11]</span></td>
                                <td><span class="cnic_no_value fw-bold">-</span></td>
                                <td><span class="cnic_no_value fw-bold">[PATIENT_CNIC_12]</span></td>
                            </tr>
                        </tbody>
                    </table>


                    <table style="width: 100%;">
                        <tbody>
                            <tr>
                                <td width="50%"><span class="full-width-flex"> <span>Passport Number: </span><span class="pp_no remaining-width fw-bold">[PATIENT_PPNO]</span></span></td>
                                <td width="50%"><span class="full-width-flex"> <span>Flight No: </span><span class="flight_no remaining-width fw-bold">[PATIENT_FLIGHT_NO]</span></span></td>
                            </tr>
                            <tr>
                                <td width="50%"><span class="full-width-flex"> <span>Ticket No: </span><span class="ticket_no remaining-width fw-bold">[PATIENT_BOOKING_REF_NO]</span></span></td>
                                <td width="50%"><span class="full-width-flex"> <span>Departure Date: </span><span class="flight_date remaining-width fw-bold">[PATIENT_FLIGHT_DATE]</span></span></td>
                            </tr>
                        </tbody>
                    </table>

                    <p style="margin-top:0in;margin-right:0in;margin-bottom:.0001pt;margin-left:0in;text-indent:-.1pt;font-size:13px;font-family:&quot;Calibri&quot;,sans-serif;"><span style="font-size:16px;">&nbsp;</span></p>

                    <p style='margin-top:0in;margin-right:0in;margin-bottom:12.0pt;margin-left:.05pt;text-indent:-.15pt;font-size:13px;font-family:"Calibri",sans-serif;'><strong><u><span style="font-size:17px;">Section 2. Clinical Information</span></u></strong></p>

                    <div style="padding-left: 10px;">Patient’s signs and symptoms:  If present mark the squares with (✔)</div>

                    <div class="clinical-info">
                        <div class="item">
                            Dry Cough <input type="checkbox">
                        </div>
                        <div class="item">
                            Fever <input type="checkbox">
                        </div>
                        <div class="item">
                            Tredness <input type="checkbox">
                        </div>
                        <div class="item">
                            Chest pain <input type="checkbox">
                        </div>
                        <div class="item">
                            Sore throat <input type="checkbox">
                        </div>
                        <div class="item">
                            Runny nose <input type="checkbox">
                        </div>
                        <div class="item">
                            Body aches <input type="checkbox">
                        </div>
                        <div class="item">
                            Loss of smell <input type="checkbox">
                        </div>
                        <div class="item">
                            Loss of taste <input type="checkbox">
                        </div>
                        <div class="item">
                            Temperature ________F
                        </div>
                    </div>

                    <p>&nbsp;</p>
                    <p style='margin-top:0in;margin-right:0in;margin-bottom:12.0pt;margin-left:.05pt;text-indent:-.15pt;font-size:13px;font-family:"Calibri",sans-serif;'><strong><u><span style="font-size:17px;">Section 3: Exposure and travel information</span></u></strong></p>
                    <p style='margin-top:0in;margin-right:0in;margin-bottom:.0001pt;margin-left:0in;text-indent:-.1pt;font-size:13px;font-family:"Calibri",sans-serif;line-height:150%;'>&nbsp;Travel history during 14 days prior to onset of symptoms: _____________________________________________________</p>

                    <table style="width: 100%;">
                        <tbody>
                            <tr>
                            <td width="40%">Contact with a suspectedor confirmed case of COVID-19:</td>
                            <td>Yes <input type="checkbox" /></span></td>
                            <td>No <input type="checkbox" /></span></td>
                        </tr>
                        <tr>
                            <td width="40%">Has the patient had any direct or indirect:</td>
                            <td>Yes <input type="checkbox" /></span></td>
                            <td>No <input type="checkbox" /></span></td>
                        </tr>
                        </tbody>
                    </table>

                    <p>&nbsp;</p>


                    <p style='margin-top:0in;margin-right:0in;margin-bottom:12.0pt;margin-left:.05pt;text-indent:-.15pt;font-size:13px;font-family:"Calibri",sans-serif;'><strong><u><span style="font-size:17px;">Section 4: Patient information and consent</span></u></strong></p>
                    <ol style="list-style-type: decimal;margin-left:10px;padding-left:10px;">
                        <li><span style='font-family:"Quattrocento Sans";'>I __________________________________________ confirm that I have verified that the data provided above is correct to the best of my knowledge.</span></li>
                        <li><span style='font-family:"Quattrocento Sans";'>That I will cooperate with Islamabad Diagnostic Centre (Pvt Ltd) for the test to the best of my ability.</span></li>
                        <li><span style='font-family:"Quattrocento Sans";'>That I have completely understood the procedure guidelines provided in Section4, and I understand the limitations of this procedure as mentioned above and also that it is a notifyable disease.</span></li>
                        <li><span style='font-family:"Quattrocento Sans";'>That I consent and fully agree to all undertakings given in section 4.</span></li>
                        <li><span style='font-family:"Quattrocento Sans";'>False positive and false negative COVID-19 PCR test can be because of certain variables including post sample exposure, travel time, technology and technique limitations. In such case IDC does not bear any responsibility and I surrender my authority and right to claim compensation/damages (civil/criminal) for any result.</span></li>
                        <li><span style="font-family:Arial;">Negative patients can become positive upon arrival in the destination country as a result of exposure during the time interval between sampling and arrival at the destination.</span></li>
                        <li>I will not hold IDC responsible for any issues faced by meanwhile travelling due to provision of incomplete information required by respective airlines. Such information may contain but is not limited to passport number, ticket number, date of departure etc.</li>
                        <li>Test report validity time varies from airline to airline. I fully understand that it is the sole responsibility of the passenger to ensure he/she gets the test done within the acceptable time window of his/her respective airline. Airline and IDC will not be responsible for any travel difficulty arising due to report expiry.</li>
                        <li>I authorize and fully consent to Islamabad Diagnostic Centre Pvt Ltd. sharing this COVID-19 PCR test report with Etihad Airways for the conditional purpose(s) of assessment and acceptance as a passenger on the Airline. I acknowledge I have been fully informed of this requirement and freely give my consent to the release of this information to Etihad Airways. I understand that Etihad Airways will not share these test results with any third party unless determined lawfully necessary. Where applicable, if I am consenting to the release of this information to Etihad Airways on behalf of a child I acknowledge and agree that I have the legal capacity to do so as a parent or legal guardian of that child (applicable for Etihad Airways customers only).</li>
                    </ol>
                    <p style='margin-top:0in;margin-right:0in;margin-bottom:.0001pt;margin-left:0in;text-indent:-.1pt;font-size:13px;font-family:"Calibri",sans-serif;'><span style="font-size:16px;">&nbsp;</span></p>
                    <p style='margin-top:0in;margin-right:0in;margin-bottom:.0001pt;margin-left:0in;text-indent:-.1pt;font-size:13px;font-family:"Calibri",sans-serif;'><span style="font-size:16px;">&nbsp;</span></p>
                    <p style='margin-top:0in;margin-right:0in;margin-bottom:.0001pt;margin-left:0in;text-indent:-.1pt;font-size:13px;font-family:"Calibri",sans-serif;'><span style="font-size:16px;">&nbsp;</span></p>
                    <p style='margin-top:0in;margin-right:0in;margin-bottom:.0001pt;margin-left:0in;text-indent:-.1pt;font-size:13px;font-family:"Calibri",sans-serif;'><span style="font-size:16px;">&nbsp;____________________________________________</span></p>
                    <p style='margin-top:0in;margin-right:0in;margin-bottom:.0001pt;margin-left:0in;text-indent:-.1pt;font-size:13px;font-family:"Calibri",sans-serif;'><span style="font-size:16px;">Patient Name and Signature</span></p>
                </div>`,
        // QATARAW | Qatar Airways
        '811': `<div class="page">
                    <style>
                        table {
                            font-size: 13px;
                        }
                        .fw-bold {
                            font-weight: bold;
                        }
                        .full-width-flex {
                            display: flex;
                            width: 100%;
                        }
                        .remaining-width {
                            flex-grow: 100; border-bottom: 1px dashed; margin: 0 10px;
                        }
                        .cnic-table{
                            width: 74%; border-collapse: collapse;
                        }
                        .cnic-table tbody tr {
                            height: 25px;
                        }
                        .cnic-table tbody tr td {
                            border: 1px solid #000; margin: 0; padding: 0; text-align: center; width: 6%;
                        }

                        .clinical-info {
                            display: flex; flex-direction: row; width: 100%; flex-wrap: wrap;
                        }
                        .clinical-info .item {
                            margin: 2px 9px;
                        }
                    </style>


                    <p style='margin-top:0in;margin-right:2.0pt;margin-bottom:.0001pt;margin-left:.05pt;text-indent:-.15pt;font-size:13px;font-family:"Calibri",sans-serif;text-align:center;line-height:98%;'><strong><span style="font-size:17px;line-height:98%;">Islamabad Diagnostic Centre (Pvt Ltd)</span></strong></p>
                    <p style='margin-top:0in;margin-right:2.0pt;margin-bottom:.0001pt;margin-left:.05pt;text-indent:-.15pt;font-size:13px;font-family:"Calibri",sans-serif;text-align:center;line-height:98%;'><strong><span style="font-size:17px;line-height:98%;">Consent &amp; Case report form for Novel Coronavirus COVID-19</span></strong></p>
                    <p style='margin-top:0in;margin-right:0in;margin-bottom:.0001pt;margin-left:0in;text-indent:-.1pt;font-size:13px;font-family:"Calibri",sans-serif;'><span style="font-size:16px;">&nbsp;</span></p>
                    <p style='margin-top:0in;margin-right:0in;margin-bottom:12.0pt;margin-left:.05pt;text-indent:-.15pt;font-size:13px;font-family:"Calibri",sans-serif;'><strong><u><span style="font-size:17px;">Section 1. Patient information</span></u></strong></p>
                    <table class="table" style="width: 100%;">
                        <tbody>
                            <tr>
                                <td width="40%"><span class="full-width-flex"><span>Name: </span><span class="name_value remaining-width fw-bold">[PATIENT_NAME]</span></span></td>
                                <td width="15%"><span class="full-width-flex"><span>Age: </span><span class="age_value remaining-width fw-bold">[PATIENT_AGE]</span></span></td>
                                <td width="15%"><span class="full-width-flex"><span>Sex: </span><span class="sex_value remaining-width fw-bold">[PATIENT_GENDER]</span></span></td>
                                <td width="30%"><span class="full-width-flex"><span>Contect: </span><span class="contact_value remaining-width fw-bold">[PATIENT_MOBILE]</span></span></td>
                            </tr>
                        </tbody>
                    </table>
                    <table class="table" style="width: 100%;">
                        <tbody>
                            <tr>
                                <td width="70%"><span class="full-width-flex"><span>Place of residence/address: </span><span class="pat_address_value remaining-width fw-bold">[PATIENT_ADDRESS]</span></span></td>
                                <td width="30%"><span class="full-width-flex"><span>Date of visit: </span><span class="visit_date_value remaining-width fw-bold">[PATIENT_VISIT_DATE]</span></span></td>
                            </tr>
                        </tbody>
                    </table>

                    <table class="table" style="width: 100%;">
                        <tbody>
                            <tr>
                                <td width="20%"><span class="full-width-flex"><span>Type of Visit: </span><span class="visit_type_value remaining-width"></span></span></td>
                                <td width="20%"><span>First visit: </span><span class="first_visit_value"><input type="checkbox"></input></span></td>
                                <td width="20%"><span>Follow up visit: </span><span class="followup_visit_value"><input type="checkbox"></input></span></td>
                                <td width="40%"><span class="full-width-flex"><span>Results of previous test if done: </span><span class="prev_result_value remaining-width"></span></span></td>
                            </tr>
                        </tbody>
                    </table>

                    <table class="table cnic-table">
                        <tbody>
                            <tr>
                                <td><span class="cnic_no_value fw-bold">[PATIENT_CNIC_0]</span></td>
                                <td><span class="cnic_no_value fw-bold">[PATIENT_CNIC_1]</span></td>
                                <td><span class="cnic_no_value fw-bold">[PATIENT_CNIC_2]</span></td>
                                <td><span class="cnic_no_value fw-bold">[PATIENT_CNIC_3]</span></td>
                                <td><span class="cnic_no_value fw-bold">[PATIENT_CNIC_4]</span></td>
                                <td><span class="cnic_no_value fw-bold">-</span></td>
                                <td><span class="cnic_no_value fw-bold">[PATIENT_CNIC_5]</span></td>
                                <td><span class="cnic_no_value fw-bold">[PATIENT_CNIC_6]</span></td>
                                <td><span class="cnic_no_value fw-bold">[PATIENT_CNIC_7]</span></td>
                                <td><span class="cnic_no_value fw-bold">[PATIENT_CNIC_8]</span></td>
                                <td><span class="cnic_no_value fw-bold">[PATIENT_CNIC_9]</span></td>
                                <td><span class="cnic_no_value fw-bold">[PATIENT_CNIC_10]</span></td>
                                <td><span class="cnic_no_value fw-bold">[PATIENT_CNIC_11]</span></td>
                                <td><span class="cnic_no_value fw-bold">-</span></td>
                                <td><span class="cnic_no_value fw-bold">[PATIENT_CNIC_12]</span></td>
                            </tr>
                        </tbody>
                    </table>


                    <table style="width: 100%;">
                        <tbody>
                            <tr>
                                <td width="50%"><span class="full-width-flex"> <span>Passport Number: </span><span class="pp_no remaining-width fw-bold">[PATIENT_PPNO]</span></span></td>
                                <td width="50%"><span class="full-width-flex"> <span>Flight No: </span><span class="flight_no remaining-width fw-bold">[PATIENT_FLIGHT_NO]</span></span></td>
                            </tr>
                            <tr>
                                <td width="50%"><span class="full-width-flex"> <span>Ticket No: </span><span class="ticket_no remaining-width fw-bold">[PATIENT_BOOKING_REF_NO]</span></span></td>
                                <td width="50%"><span class="full-width-flex"> <span>Departure Date: </span><span class="flight_date remaining-width fw-bold">[PATIENT_FLIGHT_DATE]</span></span></td>
                            </tr>
                        </tbody>
                    </table>

                    <p style="margin-top:0in;margin-right:0in;margin-bottom:.0001pt;margin-left:0in;text-indent:-.1pt;font-size:13px;font-family:&quot;Calibri&quot;,sans-serif;"><span style="font-size:16px;">&nbsp;</span></p>

                    <p style='margin-top:0in;margin-right:0in;margin-bottom:12.0pt;margin-left:.05pt;text-indent:-.15pt;font-size:13px;font-family:"Calibri",sans-serif;'><strong><u><span style="font-size:17px;">Section 2. Clinical Information</span></u></strong></p>

                    <div style="padding-left: 10px;">Patient’s signs and symptoms:  If present mark the squares with (✔)</div>

                    <div class="clinical-info">
                        <div class="item">
                            Dry Cough <input type="checkbox">
                        </div>
                        <div class="item">
                            Fever <input type="checkbox">
                        </div>
                        <div class="item">
                            Tredness <input type="checkbox">
                        </div>
                        <div class="item">
                            Chest pain <input type="checkbox">
                        </div>
                        <div class="item">
                            Sore throat <input type="checkbox">
                        </div>
                        <div class="item">
                            Runny nose <input type="checkbox">
                        </div>
                        <div class="item">
                            Body aches <input type="checkbox">
                        </div>
                        <div class="item">
                            Loss of smell <input type="checkbox">
                        </div>
                        <div class="item">
                            Loss of taste <input type="checkbox">
                        </div>
                        <div class="item">
                            Temperature ________F
                        </div>
                    </div>

                    <p>&nbsp;</p>
                    <p style='margin-top:0in;margin-right:0in;margin-bottom:12.0pt;margin-left:.05pt;text-indent:-.15pt;font-size:13px;font-family:"Calibri",sans-serif;'><strong><u><span style="font-size:17px;">Section 3: Exposure and travel information</span></u></strong></p>
                    <p style='margin-top:0in;margin-right:0in;margin-bottom:.0001pt;margin-left:0in;text-indent:-.1pt;font-size:13px;font-family:"Calibri",sans-serif;line-height:150%;'>&nbsp;Travel history during 14 days prior to onset of symptoms: _____________________________________________________</p>

                    <table style="width: 100%;">
                        <tbody>
                            <tr>
                            <td width="40%">Contact with a suspectedor confirmed case of COVID-19:</td>
                            <td>Yes <input type="checkbox" /></span></td>
                            <td>No <input type="checkbox" /></span></td>
                        </tr>
                        <tr>
                            <td width="40%">Has the patient had any direct or indirect:</td>
                            <td>Yes <input type="checkbox" /></span></td>
                            <td>No <input type="checkbox" /></span></td>
                        </tr>
                        </tbody>
                    </table>

                    <p>&nbsp;</p>


                    <p style='margin-top:0in;margin-right:0in;margin-bottom:12.0pt;margin-left:.05pt;text-indent:-.15pt;font-size:13px;font-family:"Calibri",sans-serif;'><strong><u><span style="font-size:17px;">Section 4: Patient information and consent</span></u></strong></p>
                    <ol style="list-style-type: decimal;margin-left:10px;padding-left:10px;">
                        <li><span style='font-family:"Quattrocento Sans";'>I __________________________________________ confirm that I have verified that the data provided above is correct to the best of my knowledge.</span></li>
                        <li><span style='font-family:"Quattrocento Sans";'>That I will cooperate with Islamabad Diagnostic Centre (Pvt Ltd) for the test to the best of my ability.</span></li>
                        <li><span style='font-family:"Quattrocento Sans";'>That I have completely understood the procedure guidelines provided in Section4, and I understand the limitations of this procedure as mentioned above and also that it is a notifyable disease.</span></li>
                        <li><span style='font-family:"Quattrocento Sans";'>That I consent and fully agree to all undertakings given in section 4.</span></li>
                        <li><span style='font-family:"Quattrocento Sans";'>False positive and false negative COVID-19 PCR test can be because of certain variables including post sample exposure, travel time, technology and technique limitations. In such case IDC does not bear any responsibility and I surrender my authority and right to claim compensation/damages (civil/criminal) for any result.</span></li>
                        <li><span style="font-family:Arial;">Negative patients can become positive upon arrival in the destination country as a result of exposure during the time interval between sampling and arrival at the destination.</span></li>
                        <li>I will not hold IDC responsible for any issues faced by meanwhile travelling due to provision of incomplete information required by respective airlines. Such information may contain but is not limited to passport number, ticket number, date of departure etc.</li>
                        <li>Test report validity time varies from airline to airline. I fully understand that it is the sole responsibility of the passenger to ensure he/she gets the test done within the acceptable time window of his/her respective airline. Airline and IDC will not be responsible for any travel difficulty arising due to report expiry.</li>
                        <li>I authorize and fully consent to Islamabad Diagnostic Centre Pvt Ltd. sharing this COVID-19 PCR test report with Qatar Airways for the conditional purpose(s) of assessment and acceptance as a passenger on the Airline. I acknowledge I have been fully informed of this requirement and freely give my consent to the release of this information to Qatar Airways. I understand that Qatar Airways will not share these test results with any third party unless determined lawfully necessary. Where applicable, if I am consenting to the release of this information to Qatar Airways on behalf of a child I acknowledge and agree that I have the legal capacity to do so as a parent or legal guardian of that child (applicable for Qatar Airways customers only).</li>
                    </ol>
                    <p style='margin-top:0in;margin-right:0in;margin-bottom:.0001pt;margin-left:0in;text-indent:-.1pt;font-size:13px;font-family:"Calibri",sans-serif;'><span style="font-size:16px;">&nbsp;</span></p>
                    <p style='margin-top:0in;margin-right:0in;margin-bottom:.0001pt;margin-left:0in;text-indent:-.1pt;font-size:13px;font-family:"Calibri",sans-serif;'><span style="font-size:16px;">&nbsp;</span></p>
                    <p style='margin-top:0in;margin-right:0in;margin-bottom:.0001pt;margin-left:0in;text-indent:-.1pt;font-size:13px;font-family:"Calibri",sans-serif;'><span style="font-size:16px;">&nbsp;</span></p>
                    <p style='margin-top:0in;margin-right:0in;margin-bottom:.0001pt;margin-left:0in;text-indent:-.1pt;font-size:13px;font-family:"Calibri",sans-serif;'><span style="font-size:16px;">&nbsp;____________________________________________</span></p>
                    <p style='margin-top:0in;margin-right:0in;margin-bottom:.0001pt;margin-left:0in;text-indent:-.1pt;font-size:13px;font-family:"Calibri",sans-serif;'><span style="font-size:16px;">Patient Name and Signature</span></p>
                </div>`,
        // TURKISH | Turkish Airline (GERRYS)
        '_803_': `<div class="page">
                <style>
                    table {
                        width: 100%;
                        border-spacing:0;
                        border-collapse: collapse;
                    }
                    table.bordered tbody tr td {
                        border: 1px solid #aaa;
                    }
                    table tbody tr td.col-1 {
                        width: 35%;
                    }
                </style>

                <div><br></div>
                <p><strong><span style="font-size:17px;color:red;">STRICTLY CONFIDENTIAL</span></strong></p>
                
                <h1>PASSENGER CONSENT FORM</h1>
                <h2>For Turkish Airlines to be allowed access to their medical record</h2>
                
                <table class="bordered">
                    <tbody>
                        <tr>
                            <td class="col-1">Name</td>
                            <td class="col-2">[PATIENT_NAME]</td>
                        </tr>
                        <tr>
                            <td class="col-1">Date of Birth</td>
                            <td class="col-2">[PATIENT_DOB]</td>
                        </tr>
                        <tr>
                            <td class="col-1">Nationality</td>
                            <td class="col-2">[PATIENT_NATIONALITY]</td>
                        </tr>
                        <tr>
                            <td class="col-1">Passport Number</td>
                            <td class="col-2">[PATIENT_PPNO]</td>
                        </tr>
                        <tr>
                            <td class="col-1">Flight Number</td>
                            <td class="col-2">[PATIENT_FLIGHT_NO]</td>
                        </tr>
                        <tr>
                            <td class="col-1">Flight Date</td>
                            <td class="col-2">[PATIENT_FLIGHT_DATE]</td>
                        </tr>
                        <tr>
                            <td class="col-1">Booking Reference / Ticket / PNR</td>
                            <td class="col-2">[PATIENT_BOOKING_REF_NO]</td>
                        </tr>
                        <tr>
                            <td class="col-1">Email</td>
                            <td class="col-2">[PATIENT_EMAIL]</td>
                        </tr>
                        <tr>
                            <td class="col-1">Contact Number</td>
                            <td class="col-2">[PATIENT_MOBILE]</td>
                        </tr>
                        <tr>
                            <td class="col-1">Sample Collection Location (City)</td>
                            <td class="col-2">[PATIENT_SAMPLE_COLLECTION_LOC]</td>
                        </tr>
                        <tr>
                            <td class="col-1">CNIC</td>
                            <td class="col-2">[PATIENT_CNIC]</td>
                        </tr>
                        <tr>
                            <td class="col-1">LAB</td>
                            <td class="col-2">[PATIENT_LAB]</td>
                        </tr>
                    </tbody>
                </table>
                <br><br>
                <h3>CONSENT:</h3>
                <p>I have read this form and fully understand the contents of it. I understand that filling in and signing this form gives you permission to give copies of my PCR - COVID 19 reports to Turkish Airline for travelling purpose. Please give copy of my PCR report, in line with the Data Protection Act 2018, within 30 days</p>
                
                <br><br>
                <h3>TERMS AND CONDITIONS:</h3>
                <ul style="list-style-type: disc;">
                    <li><span style="font-size:13px;">All amounts paid shall be&nbsp;non-refundable.</span></li>
                    <li><span style="font-size:13px;">Test results are valid for maximum of 96&nbsp;hours.</span></li>
                    <li><span style="font-size:13px;">Gerry’s&nbsp;Visa&nbsp;will&nbsp;get&nbsp;the&nbsp;collected&nbsp;samples&nbsp;tested&nbsp;from&nbsp;designated&nbsp;labs&nbsp;on&nbsp;its&nbsp;panel&nbsp;and&nbsp;Gerry&nbsp;’s&nbsp;or&nbsp;Turkish Airlines shall not be liable for the outcome of the test.</span></li>
                    <li><span style="font-size:13px;">Gerry’s or Turkish Airlines shall not be liable for any damages, claims or other consequences including expenses&nbsp;arising&nbsp;out&nbsp;of&nbsp;any&nbsp;loss,&nbsp;temporary&nbsp;misplacement,&nbsp;delay,&nbsp;or&nbsp;damage&nbsp;to&nbsp;the&nbsp;test&nbsp;results&nbsp;once&nbsp;handed over to the&nbsp;passenger.</span></li>
                    <li><span style="font-size:13px;">While the said tests are minimally invasive and designed to be conducted with minimum discomfort to the patient, all medical procedures bear some&nbsp;risk.</span></li>
                </ul>

                <br><br><br><br>
                <p style="margin:0in;margin-bottom:.0001pt;font-size:15px;font-family:&quot;Carlito&quot;,sans-serif;margin-left:5.0pt;text-align:justify;"><strong>Passenger Signature &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;Date</strong></p></body>
            </div>`,
        '803': `<div class="page">
            <style>
                table {
                    width: 100%;
                    border-spacing:0;
                    border-collapse: collapse;
                }
                table.bordered tbody tr td {
                    border: 1px solid #aaa;
                }
                table tbody tr td.col-1 {
                    width: 35%;
                }
            </style>

            <div><br></div>
            <p><strong><span style="font-size:17px;color:red;">STRICTLY CONFIDENTIAL</span></strong></p>
            
            <h1>PASSENGER CONSENT FORM</h1>
            <h2>For Turkish Airlines to be allowed access to their medical record</h2>
            
            <table class="bordered">
                <tbody>
                    <tr>
                        <td class="col-1">Passport Number</td>
                        <td class="col-2">[PATIENT_PPNO]</td>
                    </tr>
                    <tr>
                        <td class="col-1">Name</td>
                        <td class="col-2">[PATIENT_NAME]</td>
                    </tr>
                    <tr>
                        <td class="col-1">Date of Birth</td>
                        <td class="col-2">[PATIENT_DOB]</td>
                    </tr>
                    <tr>
                        <td class="col-1">Nationality</td>
                        <td class="col-2">[PATIENT_NATIONALITY]</td>
                    </tr>
                    <tr>
                        <td class="col-1">CNIC</td>
                        <td class="col-2">[PATIENT_CNIC]</td>
                    </tr>
                    <tr>
                        <td class="col-1">Contact Number</td>
                        <td class="col-2">[PATIENT_MOBILE]</td>
                    </tr>
                    <tr>
                        <td class="col-1">Email Address</td>
                        <td class="col-2">[PATIENT_EMAIL]</td>
                    </tr>
                    <tr>
                        <td class="col-1">Flight Number</td>
                        <td class="col-2">[PATIENT_FLIGHT_NO]</td>
                    </tr>
                    <tr>
                        <td class="col-1">Flight Date & Time</td>
                        <td class="col-2">[PATIENT_FLIGHT_DATE]</td>
                    </tr>
                    <tr>
                        <td class="col-1">PNR No</td>
                        <td class="col-2"></td>
                    </tr>
                    <tr>
                        <td class="col-1">Booking / Reference Number / Ticket No.</td>
                        <td class="col-2">[PATIENT_BOOKING_REF_NO]</td>
                    </tr>
                    <tr>
                        <td class="col-1">Departure City</td>
                        <td class="col-2"></td>
                    </tr>
                    <tr>
                        <td class="col-1">Destination Country</td>
                        <td class="col-2"></td>
                    </tr>
                    <tr>
                        <td class="col-1">LAB/ Sample Collection City</td>
                        <td class="col-2">[PATIENT_SAMPLE_COLLECTION_LOC]</td>
                    </tr>
                    <tr>
                        <td class="col-1">Door Step Sample Collection</td>
                        <td class="col-2"></td>
                    </tr>
                    <tr>
                        <td class="col-1">Test type (Urgent/Normal)</td>
                        <td class="col-2"></td>
                    </tr>

                </tbody>
            </table>
            <br><br>
            <h3>CONSENT:</h3>
            <p>I have read this form and fully understand the contents of it. I understand that filling in and signing this form gives you permission to give copies of my PCR - COVID 19 reports to Turkish Airline for travelling purpose. Please give copy of my PCR report, in line with the Data Protection Act 2018, within 30 days</p>
            
            <br><br>
            <h3>TERMS AND CONDITIONS:</h3>
            <ul style="list-style-type: disc;">
                <li><span style="font-size:13px;">All amounts paid shall be&nbsp;non-refundable.</span></li>
                <li><span style="font-size:13px;">Test results are valid for maximum of 96&nbsp;hours.</span></li>
                <li><span style="font-size:13px;">Gerry’s&nbsp;Visa&nbsp;will&nbsp;get&nbsp;the&nbsp;collected&nbsp;samples&nbsp;tested&nbsp;from&nbsp;designated&nbsp;labs&nbsp;on&nbsp;its&nbsp;panel&nbsp;and&nbsp;Gerry&nbsp;’s&nbsp;or&nbsp;Turkish Airlines shall not be liable for the outcome of the test.</span></li>
                <li><span style="font-size:13px;">Gerry’s or Turkish Airlines shall not be liable for any damages, claims or other consequences including expenses&nbsp;arising&nbsp;out&nbsp;of&nbsp;any&nbsp;loss,&nbsp;temporary&nbsp;misplacement,&nbsp;delay,&nbsp;or&nbsp;damage&nbsp;to&nbsp;the&nbsp;test&nbsp;results&nbsp;once&nbsp;handed over to the&nbsp;passenger.</span></li>
                <li><span style="font-size:13px;">While the said tests are minimally invasive and designed to be conducted with minimum discomfort to the patient, all medical procedures bear some&nbsp;risk.</span></li>
            </ul>

            <br><br><br><br>
            <p style="margin:0in;margin-bottom:.0001pt;font-size:15px;font-family:&quot;Carlito&quot;,sans-serif;margin-left:5.0pt;text-align:justify;"><strong>Passenger Signature &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;Date</strong></p></body>
        </div>`

    }
}