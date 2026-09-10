import { useSyncExternalStore } from 'react'

export type Language = 'en' | 'hi' | 'mr'

export const languages: Record<Language, string> = {
  en: 'English',
  hi: 'हिन्दी',
  mr: 'मराठी',
}

const translations = {
  /* =====================================================
     ENGLISH
     ===================================================== */

  en: {
    dashboard: {
      greeting: 'Good evening',

      overview: "Today's healthcare overview",

      headline: 'Making every screening count.',

      description:
        'Continue patient screening, track referrals and keep healthcare records connected.',

      startScreening: 'Start screening',

      patientsToday: 'Patients today',

      screenings: 'Screenings',

      followUps: 'Follow-ups',

      fromYesterday: '+4 from yesterday',

      completed: '75% completed',

      dueToday: '2 due today',

      patientWorkflow: 'PATIENT WORKFLOW',

      quickActions: 'Quick actions',

      registerPatient: 'Register patient',

      registerDescription:
        'Create a new patient profile',

      continueScreening: 'Continue screening',

      continueDescription:
        'Symptoms → rPPG → TrustScore',

      viewReferrals: 'View referrals',

      referralDescription:
        'Track patients needing care',

      recentActivity: 'RECENT ACTIVITY',

      screeningStatus: 'Screening status',

      viewAll: 'View all',

      routine: 'Routine',

      consult: 'Consult',

      urgent: 'Urgent',

      trustTitle:
        'Screening confidence matters',

      trustDescription:
        'Low-confidence readings should be retaken or verified manually.',
    },

    screening: {
      eyebrow: 'Patient screening',

      title:
        "Let's understand how you are feeling.",

      description:
        'Tell us about your symptoms. This information will help guide the next screening step.',

      registration: 'Registration',

      symptomsStep: 'Symptoms',

      rppg: 'rPPG',

      triage: 'Triage',

      screeningFor: 'Screening for',

      age: 'Age',

      village: 'Village',

      symptomsTitle:
        'What symptoms are you experiencing?',

      selectAll:
        'Select all that apply.',

      moreTitle:
        'Tell us a little more',

      optional:
        'These details are optional.',

      duration:
        'How long have you had these symptoms?',

      selectDuration:
        'Select duration',

      today: 'Today',

      days23: '2–3 days',

      days47: '4–7 days',

      moreWeek:
        'More than a week',

      severity:
        'How severe do they feel?',

      selectSeverity:
        'Select severity',

      mild: 'Mild',

      moderate: 'Moderate',

      severe: 'Severe',

      measurementsTitle:
        'Do you have measurements from a healthcare worker?',

      measurementsOptional:
        'This step is optional.',

      noMeasurements:
        'No measurements available',

      noMeasurementsDescription:
        'Continue directly to camera-based screening.',

      yesMeasurements:
        'Yes, I have measurements',

      yesMeasurementsDescription:
        'Enter readings recorded by a healthcare worker.',

      recordedMeasurements:
        'Recorded measurements',

      recordedDescription:
        'Enter only measurements that are actually available.',

      bloodPressure:
        'Blood pressure',

      pulse: 'Pulse',

      temperature:
        'Temperature',

      oxygen: 'SpO₂',

      continueNote:
        'You can continue even if you do not have manual measurements.',

      continueScreening:
        'Continue to screening',
    },

    common: {
      back: 'Back',

      english: 'English',

      hindi: 'हिन्दी',

      marathi: 'मराठी',
    },
    triage: {
      eyebrow: 'Digital triage',

      title: 'Understanding the next step for this patient.',

      description:
        'SwasthOne combines symptoms, available measurements and screening information to support the next care decision.',

      recommendation: 'TRIAGE RECOMMENDATION',

      routineTitle: 'Routine care',

      routineDescription:
        'No immediate high-risk indicator was identified from the available information.',

      routineAction:
        'Continue routine care and follow-up.',

      consultTitle: 'Doctor consultation recommended',

      consultDescription:
        'The available information suggests that a healthcare professional should review the patient.',

      consultAction:
        'Request a doctor consultation.',

      urgentTitle: 'Urgent medical review recommended',

      urgentDescription:
        'The available information contains an indicator that requires prompt professional assessment.',

      urgentAction:
        'Seek prompt medical attention.',

      nextStep: 'Recommended next step',

      symptomSummary: 'Symptoms considered',

      noSymptoms: 'No symptoms recorded.',

      screeningConfidence: 'Screening confidence',

      highConfidence:
        'The screening signal passed the current confidence check.',

      lowConfidence:
        'The screening signal has low confidence and should be verified.',

      decisionSupport: 'Decision support only',

      decisionSupportText:
        'This recommendation is not a diagnosis or prescription. A qualified healthcare professional should make the final clinical decision.',

      footerNote:
        'Triage uses the information currently available in the patient record.',

      prototypeNote:
        'Prototype rule engine: the final triage result will be supplied by the dedicated triage service and can use symptoms, age, history, rPPG results and manual vitals.',
    },

    referral: {
      eyebrow: 'Referral management',
      title: 'Connect this patient to the right care.',
      description:
        'Choose an appropriate facility and create a referral that can be tracked through the care journey.',

      triage: 'Triage',
      facility: 'Facility',
      referral: 'Referral',
      followUp: 'Follow-up',

      triageResult: 'TRIAGE RESULT',
      urgent: 'Urgent review',
      consult: 'Consult recommended',
      routine: 'Routine care',

      triageSummary:
        'The referral recommendation is based on the information currently available in the patient record.',

      chooseFacility: 'Choose a healthcare facility',
      facilityDemo:
        'Facility availability shown here is demonstration data.',
      recommended: 'Recommended',

      referralDetails: 'Referral details',
      preferredDate: 'Preferred date',
      reason: 'Reason',
      urgentReview: 'Prompt professional review',
      clinicalReview: 'Clinical review',

      safetyTitle: 'Clinical decision remains with healthcare professionals',
      safetyText:
        'SwasthOne supports referral coordination. It does not independently diagnose or decide treatment.',

      footerNote:
        'The referral will be recorded in the patient journey.',
      createReferral: 'Create referral',

      prototypeNote:
        'Prototype facility data is simulated. Live PHC, appointment and government-system availability will require verified APIs and authorization.',

      trackingEyebrow: 'Referral tracking',
      trackingTitle: 'Keep the referral journey visible.',
      trackingDescription:
        'Track whether the patient has been accepted, consulted and connected to follow-up care.',

      currentStatus: 'CURRENT STATUS',
      sent: 'Referral sent',
      statusDescription:
        'The referral has been created and sent to the selected facility.',

      created: 'Created',
      createdDescription:
        'Referral created from the patient screening workflow.',

      sentDescription:
        'Referral sent to the selected healthcare facility.',

      accepted: 'Accepted',
      acceptedDescription:
        'Receiving facility confirms that the referral has been accepted.',

      appointment: 'Appointment',
      appointmentDescription:
        'An appointment or consultation slot is arranged.',

      consulted: 'Consulted',
      consultedDescription:
        'Patient completes the consultation with a healthcare professional.',

      followUpDescription:
        'Follow-up is recorded and the patient record is updated.',

      lifecycle: 'Referral lifecycle',

      continuityTitle: 'Continuity of care',
      continuityText:
        'Once the referral is completed, consultation and follow-up information can be added to the patient longitudinal record.',

      trackingSafetyTitle:
        'Referral tracking is about continuity, not just sending a referral.',

      trackingSafetyText:
        'The goal is to reduce referral drop-off and keep the patient journey connected.',

      trackingPrototypeNote:
        'Prototype status is simulated for demonstration. A production system would update these stages through authorized facility workflows and backend events.',
    },
    record: {
      eyebrow: 'Longitudinal health record',
      title: 'Keep the patient journey connected.',
      description:
        'View screening, triage, referral and follow-up information together in one patient record.',

      latestScreening: 'Latest screening',
      trustScore: 'Screening confidence',
      careStatus: 'Care status',

      careJourney: 'CARE JOURNEY',
      journeyTitle: 'Patient care timeline',

      registered: 'Patient registered',
      registeredDescription:
        'Basic patient profile and consent recorded.',

      screening: 'Symptoms and screening',
      screeningDescription:
        'Symptoms and available measurements were captured.',

      trustScoreEvent: 'TrustScore completed',
      trustScoreDescription:
        'Camera screening passed the current signal-confidence check.',

      triage: 'Digital triage',
      triageDescription:
        'Screening information was used to support the next care decision.',

      referralEvent: 'Referral created',
      referralDescription:
        'Referral sent to the selected healthcare facility.',

      followUpEvent: 'Follow-up',
      followUpDescription:
        'Follow-up will be recorded after the referral journey.',

      history: 'SCREENING HISTORY',
      historyTitle: 'Previous screening records',
      viewAll: 'View all',

      nextCare: 'NEXT CARE STEP',
      followUpTitle: 'Schedule patient follow-up',
      followUpText:
        'Keep the patient connected after referral and continue updating the longitudinal record.',

      scheduleFollowUp: 'Schedule follow-up',

      disclaimer:
        'The longitudinal record stores screening and care information. It does not replace the clinical record maintained by qualified healthcare professionals.',

      prototypeNote:
        'Prototype record data is currently local frontend data. The production version will load and update longitudinal records through the backend database.',
    },
    followUp: {
      eyebrow: 'Follow-up care',
      title: 'Keep the next step from getting missed.',
      description:
        'Schedule follow-up and choose how the patient or healthcare worker should be reminded.',

      patient: 'PATIENT',

      scheduleTitle: 'Choose follow-up timing',

      reminderTitle: 'Choose reminder method',

      smsReminder: 'Patient reminder',
      callReminder: 'Phone call',
      callDescription:
        'Healthcare worker can call the patient.',

      ashaReminder: 'ASHA follow-up',
      ashaDescription:
        'ASHA can be reminded to follow up with the patient.',

      purposeTitle: 'Why follow-up matters',
      purposeText:
        'Follow-up helps reduce loss after referral and keeps screening, consultation and care information connected.',

      footerNote:
        'The follow-up event will be added to the patient care journey.',

      confirm: 'Confirm follow-up',

      prototypeNote:
        'Prototype reminder scheduling is local to the frontend. Production reminders will use authorized backend workflows and notification services.',
    },

  },

  /* =====================================================
     HINDI
     ===================================================== */

  hi: {
    dashboard: {
      greeting: 'शुभ संध्या',

      overview:
        'आज की स्वास्थ्य सेवा का अवलोकन',

      headline:
        'हर जाँच को महत्वपूर्ण बनाएं।',

      description:
        'रोगी की जाँच जारी रखें, रेफरल ट्रैक करें और स्वास्थ्य रिकॉर्ड को जोड़े रखें।',

      startScreening:
        'जाँच शुरू करें',

      patientsToday:
        'आज के रोगी',

      screenings:
        'जाँच',

      followUps:
        'फॉलो-अप',

      fromYesterday:
        'कल से +4',

      completed:
        '75% पूर्ण',

      dueToday:
        'आज 2 बाकी',

      patientWorkflow:
        'रोगी कार्यप्रवाह',

      quickActions:
        'त्वरित कार्य',

      registerPatient:
        'रोगी पंजीकृत करें',

      registerDescription:
        'नया रोगी प्रोफ़ाइल बनाएं',

      continueScreening:
        'जाँच जारी रखें',

      continueDescription:
        'लक्षण → rPPG → TrustScore',

      viewReferrals:
        'रेफरल देखें',

      referralDescription:
        'देखभाल की आवश्यकता वाले रोगियों को ट्रैक करें',

      recentActivity:
        'हाल की गतिविधि',

      screeningStatus:
        'जाँच की स्थिति',

      viewAll:
        'सभी देखें',

      routine:
        'सामान्य',

      consult:
        'परामर्श',

      urgent:
        'तत्काल',

      trustTitle:
        'जाँच की विश्वसनीयता महत्वपूर्ण है',

      trustDescription:
        'कम विश्वसनीयता वाली रीडिंग दोबारा ली जानी चाहिए या मैनुअल माप से सत्यापित की जानी चाहिए।',
    },

    screening: {
      eyebrow:
        'रोगी की जाँच',

      title:
        'आइए समझते हैं कि आप कैसा महसूस कर रहे हैं।',

      description:
        'अपने लक्षणों के बारे में बताएं। यह जानकारी अगले जाँच चरण में मदद करेगी।',

      registration:
        'पंजीकरण',

      symptomsStep:
        'लक्षण',

      rppg: 'rPPG',

      triage:
        'ट्रायेज',

      screeningFor:
        'जाँच के लिए',

      age: 'उम्र',

      village:
        'गाँव',

      symptomsTitle:
        'आपको कौन-कौन से लक्षण महसूस हो रहे हैं?',

      selectAll:
        'जो लागू हों उन्हें चुनें।',

      moreTitle:
        'थोड़ी और जानकारी दें',

      optional:
        'ये विवरण वैकल्पिक हैं।',

      duration:
        'आपको ये लक्षण कितने समय से हैं?',

      selectDuration:
        'अवधि चुनें',

      today:
        'आज',

      days23:
        '2–3 दिन',

      days47:
        '4–7 दिन',

      moreWeek:
        'एक सप्ताह से अधिक',

      severity:
        'लक्षण कितने गंभीर महसूस होते हैं?',

      selectSeverity:
        'गंभीरता चुनें',

      mild:
        'हल्के',

      moderate:
        'मध्यम',

      severe:
        'गंभीर',

      measurementsTitle:
        'क्या आपके पास स्वास्थ्यकर्मी द्वारा लिए गए माप हैं?',

      measurementsOptional:
        'यह चरण वैकल्पिक है।',

      noMeasurements:
        'कोई माप उपलब्ध नहीं है',

      noMeasurementsDescription:
        'सीधे कैमरा-आधारित जाँच पर जाएँ।',

      yesMeasurements:
        'हाँ, मेरे पास माप हैं',

      yesMeasurementsDescription:
        'स्वास्थ्यकर्मी द्वारा दर्ज किए गए माप दर्ज करें।',

      recordedMeasurements:
        'दर्ज किए गए माप',

      recordedDescription:
        'केवल उपलब्ध माप ही दर्ज करें।',

      bloodPressure:
        'ब्लड प्रेशर',

      pulse:
        'नाड़ी',

      temperature:
        'तापमान',

      oxygen:
        'SpO₂',

      continueNote:
        'अगर आपके पास मैनुअल माप नहीं हैं, तब भी आप आगे बढ़ सकते हैं।',

      continueScreening:
        'जाँच पर जाएँ',
    },

    common: {
      back:
        'वापस',

      english:
        'English',

      hindi:
        'हिन्दी',

      marathi:
        'मराठी',
    },
    triage: {
      eyebrow: 'डिजिटल ट्रायेज',

      title:
        'इस रोगी के लिए अगले कदम को समझना।',

      description:
        'SwasthOne लक्षणों, उपलब्ध माप और जाँच की जानकारी को मिलाकर अगले उपचार निर्णय में सहायता करता है।',

      recommendation:
        'ट्रायेज सुझाव',

      routineTitle:
        'सामान्य देखभाल',

      routineDescription:
        'उपलब्ध जानकारी के आधार पर तत्काल उच्च जोखिम का संकेत नहीं मिला।',

      routineAction:
        'सामान्य देखभाल और फॉलो-अप जारी रखें।',

      consultTitle:
        'डॉक्टर से परामर्श की सलाह',

      consultDescription:
        'उपलब्ध जानकारी के आधार पर स्वास्थ्यकर्मी द्वारा रोगी की समीक्षा की जानी चाहिए।',

      consultAction:
        'डॉक्टर से परामर्श का अनुरोध करें।',

      urgentTitle:
        'तत्काल चिकित्सकीय जाँच की सलाह',

      urgentDescription:
        'उपलब्ध जानकारी में ऐसा संकेत है जिसके लिए जल्द पेशेवर चिकित्सकीय मूल्यांकन आवश्यक है।',

      urgentAction:
        'जल्द चिकित्सा सहायता लें।',

      nextStep:
        'सुझाया गया अगला कदम',

      symptomSummary:
        'विचार किए गए लक्षण',

      noSymptoms:
        'कोई लक्षण दर्ज नहीं है।',

      screeningConfidence:
        'जाँच की विश्वसनीयता',

      highConfidence:
        'जाँच संकेत ने वर्तमान विश्वसनीयता जाँच पास की है।',

      lowConfidence:
        'जाँच संकेत की विश्वसनीयता कम है और इसे सत्यापित किया जाना चाहिए।',

      decisionSupport:
        'केवल निर्णय सहायता',

      decisionSupportText:
        'यह सुझाव निदान या प्रिस्क्रिप्शन नहीं है। अंतिम चिकित्सकीय निर्णय योग्य स्वास्थ्यकर्मी द्वारा लिया जाना चाहिए।',

      footerNote:
        'ट्रायेज रोगी रिकॉर्ड में वर्तमान में उपलब्ध जानकारी का उपयोग करता है।',

      prototypeNote:
        'प्रोटोटाइप नियम इंजन: अंतिम ट्रायेज परिणाम समर्पित ट्रायेज सेवा द्वारा दिया जाएगा और इसमें लक्षण, उम्र, इतिहास, rPPG परिणाम और मैनुअल माप शामिल हो सकते हैं।',
    },
  },

  /* =====================================================
     MARATHI
     ===================================================== */

  mr: {
    dashboard: {
      greeting:
        'शुभ संध्याकाळ',

      overview:
        'आजच्या आरोग्यसेवेचा आढावा',

      headline:
        'प्रत्येक तपासणी महत्त्वाची बनवा.',

      description:
        'रुग्णांची तपासणी सुरू ठेवा, रेफरलचा मागोवा घ्या आणि आरोग्य नोंदी जोडलेल्या ठेवा.',

      startScreening:
        'तपासणी सुरू करा',

      patientsToday:
        'आजचे रुग्ण',

      screenings:
        'तपासण्या',

      followUps:
        'फॉलो-अप',

      fromYesterday:
        'कालपेक्षा +4',

      completed:
        '75% पूर्ण',

      dueToday:
        'आज 2 बाकी',

      patientWorkflow:
        'रुग्ण कार्यप्रवाह',

      quickActions:
        'जलद कृती',

      registerPatient:
        'रुग्णाची नोंदणी करा',

      registerDescription:
        'नवीन रुग्ण प्रोफाइल तयार करा',

      continueScreening:
        'तपासणी सुरू ठेवा',

      continueDescription:
        'लक्षणे → rPPG → TrustScore',

      viewReferrals:
        'रेफरल पहा',

      referralDescription:
        'सेवेची गरज असलेल्या रुग्णांचा मागोवा घ्या',

      recentActivity:
        'अलीकडील क्रियाकलाप',

      screeningStatus:
        'तपासणीची स्थिती',

      viewAll:
        'सर्व पहा',

      routine:
        'सामान्य',

      consult:
        'सल्ला',

      urgent:
        'तातडीचे',

      trustTitle:
        'तपासणीचा विश्वास महत्त्वाचा आहे',

      trustDescription:
        'कमी विश्वासार्ह रीडिंग पुन्हा घेतली जाऊ शकते किंवा मॅन्युअल मोजमापाने तपासली जाऊ शकते.',
    },

    screening: {
      eyebrow:
        'रुग्णाची तपासणी',

      title:
        'तुम्हाला कसे वाटत आहे ते समजून घेऊया.',

      description:
        'तुमच्या लक्षणांबद्दल सांगा. ही माहिती पुढील तपासणीसाठी मदत करेल.',

      registration:
        'नोंदणी',

      symptomsStep:
        'लक्षणे',

      rppg:
        'rPPG',

      triage:
        'ट्रायेज',

      screeningFor:
        'तपासणी',

      age:
        'वय',

      village:
        'गाव',

      symptomsTitle:
        'तुम्हाला कोणती लक्षणे जाणवत आहेत?',

      selectAll:
        'लागू असलेली सर्व लक्षणे निवडा.',

      moreTitle:
        'थोडी अधिक माहिती द्या',

      optional:
        'ही माहिती ऐच्छिक आहे.',

      duration:
        'ही लक्षणे तुम्हाला किती दिवसांपासून आहेत?',

      selectDuration:
        'कालावधी निवडा',

      today:
        'आज',

      days23:
        '2–3 दिवस',

      days47:
        '4–7 दिवस',

      moreWeek:
        'एका आठवड्यापेक्षा जास्त',

      severity:
        'लक्षणे किती गंभीर आहेत?',

      selectSeverity:
        'तीव्रता निवडा',

      mild:
        'सौम्य',

      moderate:
        'मध्यम',

      severe:
        'गंभीर',

      measurementsTitle:
        'तुमच्याकडे आरोग्य कर्मचाऱ्यांनी घेतलेले मोजमाप आहेत का?',

      measurementsOptional:
        'हा टप्पा ऐच्छिक आहे.',

      noMeasurements:
        'मोजमाप उपलब्ध नाही',

      noMeasurementsDescription:
        'थेट कॅमेरा-आधारित तपासणीवर जा.',

      yesMeasurements:
        'होय, माझ्याकडे मोजमाप आहेत',

      yesMeasurementsDescription:
        'आरोग्य कर्मचाऱ्यांनी नोंदवलेले मोजमाप भरा.',

      recordedMeasurements:
        'नोंदवलेली मोजमापे',

      recordedDescription:
        'फक्त उपलब्ध असलेली मोजमापे भरा.',

      bloodPressure:
        'रक्तदाब',

      pulse:
        'नाडी',

      temperature:
        'तापमान',

      oxygen:
        'SpO₂',

      continueNote:
        'तुमच्याकडे मॅन्युअल मोजमाप नसले तरी तुम्ही पुढे जाऊ शकता.',

      continueScreening:
        'तपासणीवर जा',
    },

    common: {
      back:
        'मागे',

      english:
        'English',

      hindi:
        'हिन्दी',

      marathi:
        'मराठी',
    },
    triage: {
      eyebrow: 'डिजिटल ट्रायेज',

      title:
        'या रुग्णासाठी पुढील योग्य पाऊल समजून घेऊया.',

      description:
        'SwasthOne लक्षणे, उपलब्ध मोजमाप आणि तपासणीची माहिती एकत्र करून पुढील उपचार निर्णयासाठी मदत करते.',

      recommendation:
        'ट्रायेज शिफारस',

      routineTitle:
        'सामान्य काळजी',

      routineDescription:
        'उपलब्ध माहितीच्या आधारावर तातडीच्या उच्च जोखमीचे संकेत आढळले नाहीत.',

      routineAction:
        'सामान्य काळजी आणि फॉलो-अप सुरू ठेवा.',

      consultTitle:
        'डॉक्टरांच्या सल्ल्याची शिफारस',

      consultDescription:
        'उपलब्ध माहितीच्या आधारावर आरोग्य कर्मचाऱ्यांनी रुग्णाची तपासणी करणे योग्य आहे.',

      consultAction:
        'डॉक्टरांच्या सल्ल्याची विनंती करा.',

      urgentTitle:
        'तातडीच्या वैद्यकीय तपासणीची शिफारस',

      urgentDescription:
        'उपलब्ध माहितीमध्ये तातडीच्या व्यावसायिक वैद्यकीय तपासणीची गरज दर्शवणारा संकेत आहे.',

      urgentAction:
        'तातडीने वैद्यकीय मदत घ्या.',

      nextStep:
        'शिफारस केलेले पुढील पाऊल',

      symptomSummary:
        'विचारात घेतलेली लक्षणे',

      noSymptoms:
        'कोणतीही लक्षणे नोंदवलेली नाहीत.',

      screeningConfidence:
        'तपासणीचा विश्वास',

      highConfidence:
        'तपासणीच्या संकेताने सध्याची विश्वासार्हता तपासणी उत्तीर्ण केली आहे.',

      lowConfidence:
        'तपासणीच्या संकेताचा विश्वास कमी आहे आणि त्याची पडताळणी करावी.',

      decisionSupport:
        'केवळ निर्णयासाठी मदत',

      decisionSupportText:
        'ही शिफारस निदान किंवा प्रिस्क्रिप्शन नाही. अंतिम वैद्यकीय निर्णय पात्र आरोग्यकर्मचाऱ्याने घ्यावा.',

      footerNote:
        'ट्रायेज रुग्णाच्या नोंदीमध्ये सध्या उपलब्ध असलेल्या माहितीचा वापर करते.',

      prototypeNote:
        'प्रोटोटाइप नियम इंजिन: अंतिम ट्रायेज परिणाम स्वतंत्र ट्रायेज सेवेकडून दिला जाईल आणि त्यात लक्षणे, वय, इतिहास, rPPG परिणाम आणि मॅन्युअल मोजमापांचा वापर केला जाऊ शकतो.',
    },
  },
} as const

/* =========================================================
   LANGUAGE STATE
   ========================================================= */

const STORAGE_KEY = 'swasthone-language'

let currentLanguage: Language =
  (localStorage.getItem(STORAGE_KEY) as Language) || 'en'

const listeners = new Set<() => void>()

export function setLanguage(language: Language) {
  currentLanguage = language

  localStorage.setItem(
    STORAGE_KEY,
    language,
  )

  listeners.forEach((listener) => {
    listener()
  })
}

export function getLanguage() {
  return currentLanguage
}

function subscribe(listener: () => void) {
  listeners.add(listener)

  return () => {
    listeners.delete(listener)
  }
}

export function useLanguage() {
  return useSyncExternalStore(
    subscribe,
    getLanguage,
    () => 'en' as Language,
  )
}

/* =========================================================
   TRANSLATION FUNCTION
   ========================================================= */

export function t(
  section: keyof typeof translations.en,
  key: string,
): string {
  const sectionData =
    translations[currentLanguage][section]

  if (!sectionData) {
    return key
  }

  return (
    (sectionData as Record<string, string>)[key] ??
    key
  )
}