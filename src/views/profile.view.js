function getProfilePage(profileInfo, verificationReport, tutorialData) {
  const firstName = profileInfo.basicInfo?.firstName?.localized?.en_US || 'User';
  const lastName = profileInfo.basicInfo?.lastName?.localized?.en_US || '';
  const fullName = `${firstName} ${lastName}`.trim();
  const email = profileInfo.basicInfo?.primaryEmailAddress || 'Not available';
  const profileUrl = profileInfo.basicInfo?.profileUrl || '#';
  const profilePicture = profileInfo.basicInfo?.profilePicture?.croppedImage?.downloadUrl || '';
  const verifications = verificationReport.verifications || [];
  const verificationUrl = verificationReport.verificationUrl || '';
  
  const hasVerifications = verifications.length > 0;
  
  // Plus tier fields
  const education = profileInfo.mostRecentEducation;
  const experience = profileInfo.primaryCurrentPosition;
  
  const verificationCards = verifications.map(type => {
    const icons = {
      'IDENTITY': { emoji: '👤', title: 'Identity', subtitle: 'Your identity has been verified' },
      'WORKPLACE': { emoji: '🏢', title: 'Workplace', subtitle: 'Your workplace has been verified' }
    };
    const config = icons[type] || { emoji: '✓', title: type, subtitle: 'Verified' };
    
    return `
      <div class="verification-card has-tooltip">
        <div class="verification-icon">${config.emoji}</div>
        <div class="verification-info">
          <div class="verification-title">${config.title} <span class="tooltip-icon" data-tooltip-text="API: /verificationReport
Field: verifications
Type: ${type}">ⓘ</span></div>
          <div class="verification-subtitle">${config.subtitle}</div>
        </div>
        <div class="verification-check">✓</div>
      </div>
    `;
  }).join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Profile - ${fullName}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background: #f3f2ef;
      min-height: 100vh;
      padding: 40px 20px;
    }
    .container {
      max-width: 800px;
      margin: 0 auto;
    }
    .profile-card {
      background: white;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      overflow: hidden;
      margin-bottom: 20px;
    }
    .profile-header {
      background: linear-gradient(135deg, #0A66C2 0%, #004182 100%);
      height: 200px;
      position: relative;
    }
    .profile-picture {
      width: 100%;
      height: 100%;
      border-radius: 50%;
      border: 8px solid white;
      object-fit: cover;
      background: #e0e0e0;
    }
    .profile-content {
      padding-top: 170px;
      padding-bottom: 30px;
      text-align: center;
    }
    .profile-name {
      font-size: 32px;
      color: #000;
      margin-bottom: 8px;
      font-weight: 600;
      display: inline-block;
    }
    .profile-email {
      color: #666;
      font-size: 16px;
      margin-bottom: 16px;
      display: inline-block;
    }
    .verified-badge {
      display: inline-flex;
      align-items: center;
      background: #e8f5e9;
      color: #2e7d32;
      padding: 8px 16px;
      border-radius: 20px;
      font-size: 14px;
      font-weight: 500;
      margin-bottom: 24px;
    }
    .verified-badge::before {
      content: '✓';
      margin-right: 6px;
      font-weight: bold;
    }
    .button-group {
      display: flex;
      gap: 12px;
      justify-content: center;
      flex-wrap: wrap;
      padding: 0 20px;
    }
    .btn {
      background: #0A66C2;
      color: white;
      border: none;
      padding: 12px 24px;
      font-size: 14px;
      border-radius: 8px;
      cursor: pointer;
      text-decoration: none;
      display: inline-block;
      transition: all 0.3s ease;
      font-weight: 500;
    }
    .btn:hover {
      background: #004182;
      transform: translateY(-2px);
    }
    .btn-secondary {
      background: white;
      color: #0A66C2;
      border: 1px solid #0A66C2;
    }
    .btn-secondary:hover {
      background: #f3f2ef;
    }
    .section {
      background: white;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      padding: 24px;
      margin-bottom: 20px;
    }
    .section-title {
      font-size: 20px;
      color: #000;
      margin-bottom: 20px;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .verification-card {
      background: #f8f9fa;
      padding: 20px;
      border-radius: 12px;
      margin-bottom: 12px;
      display: flex;
      align-items: center;
      gap: 16px;
    }
    .verification-card:last-child {
      margin-bottom: 0;
    }
    .verification-icon {
      width: 48px;
      height: 48px;
      background: white;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24px;
      flex-shrink: 0;
    }
    .verification-info {
      flex: 1;
    }
    .verification-title {
      font-size: 16px;
      font-weight: 600;
      color: #000;
      margin-bottom: 4px;
    }
    .verification-subtitle {
      font-size: 14px;
      color: #666;
    }
    .verification-check {
      color: #2e7d32;
      font-size: 24px;
      font-weight: bold;
    }
    .info-card {
      background: white;
      border-radius: 12px;
      padding: 20px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      transition: all 0.3s ease;
    }
    .info-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }
    .api-section {
      background: white;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      padding: 24px;
    }
    .api-title {
      font-size: 20px;
      color: #000;
      margin-bottom: 20px;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .collapsible {
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      margin-bottom: 12px;
      overflow: hidden;
    }
    .collapsible-header {
      padding: 16px;
      background: #f8f9fa;
      cursor: pointer;
      display: flex;
      justify-content: space-between;
      align-items: center;
      user-select: none;
      transition: background 0.3s ease;
    }
    .collapsible-header:hover {
      background: #e9ecef;
    }
    .collapsible-header-title {
      font-weight: 600;
      color: #000;
    }
    .collapsible-chevron {
      transition: transform 0.3s ease;
      color: #666;
    }
    .collapsible-chevron.open {
      transform: rotate(180deg);
    }
    .collapsible-content {
      max-height: 0;
      overflow: hidden;
      transition: max-height 0.3s ease;
    }
    .collapsible-content.open {
      max-height: 600px;
      overflow-y: auto;
    }
    #tutorial-content.open {
      max-height: 8000px;
      overflow-y: auto;
    }
    pre {
      background: #f5f5f5;
      padding: 16px;
      border-radius: 4px;
      overflow-x: auto;
      margin: 0;
      font-size: 12px;
      line-height: 1.5;
    }
    .tutorial-section {
      background: white;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      padding: 24px;
      margin-bottom: 20px;
    }
    .tutorial-header {
      text-align: center;
      margin-bottom: 32px;
    }
    .tutorial-title {
      font-size: 24px;
      color: #000;
      margin-bottom: 8px;
      font-weight: 700;
    }
    .tutorial-subtitle {
      font-size: 14px;
      color: #666;
    }
    .flow-step {
      position: relative;
      padding-left: 60px;
      margin-bottom: 32px;
    }
    .flow-step:last-child {
      margin-bottom: 0;
    }
    .flow-step:not(:last-child)::before {
      content: '';
      position: absolute;
      left: 19px;
      top: 48px;
      bottom: -32px;
      width: 2px;
      background: linear-gradient(180deg, #0A66C2 0%, #e0e0e0 100%);
    }
    .step-number {
      position: absolute;
      left: 0;
      top: 0;
      width: 40px;
      height: 40px;
      background: linear-gradient(135deg, #0A66C2 0%, #004182 100%);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: 700;
      font-size: 16px;
      box-shadow: 0 2px 8px rgba(10, 102, 194, 0.3);
    }
    .step-number.complete::after {
      content: '✓';
      position: absolute;
      bottom: -2px;
      right: -2px;
      width: 16px;
      height: 16px;
      background: #2e7d32;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 10px;
      border: 2px solid white;
    }
    .step-content {
      background: #f8f9fa;
      padding: 20px;
      border-radius: 12px;
      border-left: 4px solid #0A66C2;
    }
    .step-title {
      font-size: 18px;
      font-weight: 600;
      color: #000;
      margin-bottom: 8px;
    }
    .step-description {
      font-size: 14px;
      color: #666;
      margin-bottom: 16px;
      line-height: 1.6;
    }
    .step-details {
      background: white;
      border-radius: 8px;
      overflow: hidden;
      border: 1px solid #e0e0e0;
      margin-top: 12px;
    }
    .detail-header {
      padding: 12px 16px;
      background: #fff;
      cursor: pointer;
      display: flex;
      justify-content: space-between;
      align-items: center;
      user-select: none;
      border-bottom: 1px solid #e0e0e0;
      transition: background 0.3s ease;
    }
    .detail-header:hover {
      background: #f8f9fa;
    }
    .detail-header-title {
      font-weight: 600;
      font-size: 13px;
      color: #0A66C2;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .detail-chevron {
      transition: transform 0.3s ease;
      color: #666;
      font-size: 12px;
    }
    .detail-chevron.open {
      transform: rotate(180deg);
    }
    .detail-content {
      max-height: 0;
      overflow: hidden;
      transition: max-height 0.3s ease;
    }
    .detail-content.open {
      max-height: 2000px;
    }
    .detail-section {
      padding: 16px;
    }
    .detail-label {
      font-size: 11px;
      font-weight: 600;
      color: #666;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 8px;
    }
    .code-block {
      background: #1e1e1e;
      color: #d4d4d4;
      padding: 12px;
      border-radius: 6px;
      font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
      font-size: 12px;
      line-height: 1.6;
      overflow-x: auto;
      margin-bottom: 12px;
      white-space: pre-wrap;
      word-break: break-word;
    }
    .code-block:last-child {
      margin-bottom: 0;
    }
    .code-comment {
      color: #6a9955;
    }
    .code-string {
      color: #ce9178;
    }
    .code-key {
      color: #9cdcfe;
    }
    .code-method {
      color: #dcdcaa;
    }
    .http-method {
      display: inline-block;
      padding: 2px 8px;
      border-radius: 4px;
      font-weight: 600;
      font-size: 11px;
      margin-right: 8px;
    }
    .http-get {
      background: #e8f5e9;
      color: #2e7d32;
    }
    .http-post {
      background: #e3f2fd;
      color: #1565c0;
    }
    .tooltip-icon {
      display: inline-block;
      font-size: 0.7em;
      color: #0A66C2;
      opacity: 0.6;
      margin-left: 4px;
      cursor: help;
      transition: opacity 0.2s ease;
      position: relative;
    }
    .btn .tooltip-icon {
      color: white;
      opacity: 0.8;
    }
    .btn-secondary .tooltip-icon {
      color: #0A66C2;
    }
    .has-tooltip {
      position: relative;
    }
    .tooltip-icon:hover {
      opacity: 1;
    }
    .tooltip-icon::after {
      content: attr(data-tooltip-text);
      position: fixed;
      background: rgba(0, 0, 0, 0.9);
      color: white;
      padding: 8px 12px;
      border-radius: 6px;
      font-size: 12px;
      white-space: pre-line;
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.2s ease;
      z-index: 10000;
      font-weight: normal;
      line-height: 1.6;
      max-width: 300px;
      text-align: left;
      left: 50%;
      top: 50%;
      transform: translate(-50%, -50%);
    }
    .tooltip-icon:hover::after {
      opacity: 1;
    }
    .profile-picture-container {
      position: relative;
      width: 300px;
      height: 300px;
      position: absolute;
      left: 50%;
      transform: translateX(-50%);
      bottom: -150px;
    }
    .picture-tooltip-icon {
      position: absolute;
      bottom: 10px;
      right: 10px;
      background: white;
      border-radius: 50%;
      width: 30px;
      height: 30px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 16px;
      color: #0A66C2;
      box-shadow: 0 2px 4px rgba(0,0,0,0.2);
      cursor: help;
      opacity: 0.8;
      transition: opacity 0.2s ease;
      z-index: 10;
      pointer-events: auto;
    }
    .picture-tooltip-icon:hover {
      opacity: 1;
    }
    .picture-tooltip-icon::after {
      content: attr(data-tooltip-text);
      position: fixed;
      background: rgba(0, 0, 0, 0.9);
      color: white;
      padding: 8px 12px;
      border-radius: 6px;
      font-size: 12px;
      white-space: pre-line;
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.2s ease;
      z-index: 10000;
      font-weight: normal;
      line-height: 1.6;
      max-width: 300px;
      text-align: left;
      left: 50%;
      top: 50%;
      transform: translate(-50%, -50%);
    }
    .picture-tooltip-icon:hover::after {
      opacity: 1;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="profile-card">
      <div class="profile-header">
        ${profilePicture ? `
          <div class="profile-picture-container">
            <img src="${profilePicture}" alt="${fullName}" class="profile-picture">
            <span class="picture-tooltip-icon" data-tooltip-text="API: /identityMe
Field: basicInfo.profilePicture.croppedImage.downloadUrl">ⓘ</span>
          </div>
        ` : '<div class="profile-picture"></div>'}
      </div>
      <div class="profile-content">
        <div style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis; padding: 0 20px;">
          <h1 class="profile-name has-tooltip">${fullName} <span class="tooltip-icon" data-tooltip-text="API: /identityMe
Field: basicInfo.firstName.localized.en_US
Field: basicInfo.lastName.localized.en_US">ⓘ</span></h1>
        </div>
        <div style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis; padding: 0 20px;">
          <p class="profile-email has-tooltip">${email} <span class="tooltip-icon" data-tooltip-text="API: /identityMe
Field: basicInfo.primaryEmailAddress">ⓘ</span></p>
        </div>
        ${hasVerifications ? '<div class="verified-badge has-tooltip">Verified on LinkedIn <span class="tooltip-icon" data-tooltip-text="API: /verificationReport\nField: verifications">ⓘ</span></div>' : ''}
        <div style="background: #e3f2fd; border-radius: 8px; padding: 12px; margin: 16px 0; font-size: 14px; color: #1565c0; text-align: center;">
          💡 <strong>Tip:</strong> Hover over elements with the ⓘ icon to see their API source and field names
        </div>
        <div class="button-group">
          <a href="${profileUrl}" target="_blank" class="btn has-tooltip">View LinkedIn Profile <span class="tooltip-icon" data-tooltip-text="API: /identityMe
Field: basicInfo.profileUrl">ⓘ</span></a>
          ${verificationUrl ? `<a href="${verificationUrl}" target="_blank" class="btn btn-secondary has-tooltip">Add More Verifications <span class="tooltip-icon" data-tooltip-text="API: /verificationReport
Field: verificationUrl">ⓘ</span></a>` : ''}
        </div>
      </div>
    </div>
    
    ${hasVerifications ? `
    <div class="section">
      <h2 class="section-title">🎉 Verifications</h2>
      ${verificationCards}
    </div>
    ` : ''}
    
    ${education ? `
    <div class="section">
      <h2 class="section-title">🎓 Education</h2>
      <div class="info-card has-tooltip">
        <div style="display: flex; align-items: center; gap: 16px;">
          ${education.schoolLogo?.originalImage?.downloadUrl ? `
            <img src="${education.schoolLogo.originalImage.downloadUrl}" alt="School Logo" style="width: 60px; height: 60px; border-radius: 8px; object-fit: contain;">
          ` : ''}
          <div style="flex: 1;">
            <div style="font-size: 18px; font-weight: 600; color: #333; margin-bottom: 4px;">
              ${education.schoolName?.localized?.en_US || education.schoolName?.localized?.[Object.keys(education.schoolName.localized)[0]] || 'School'}
              <span class="tooltip-icon" data-tooltip-text="API: /identityMe
Field: mostRecentEducation.schoolName.localized">ⓘ</span>
            </div>
            ${education.degreeName ? `
              <div style="font-size: 14px; color: #666;">
                ${education.degreeName.localized?.en_US || education.degreeName.localized?.[Object.keys(education.degreeName.localized)[0]] || ''}
                <span class="tooltip-icon" data-tooltip-text="API: /identityMe
Field: mostRecentEducation.degreeName.localized">ⓘ</span>
              </div>
            ` : ''}
          </div>
        </div>
      </div>
    </div>
    ` : ''}
    
    ${experience ? `
    <div class="section">
      <h2 class="section-title">💼 Experience</h2>
      <div class="info-card has-tooltip">
        <div style="display: flex; align-items: center; gap: 16px;">
          ${experience.companyLogo?.originalImage?.downloadUrl ? `
            <img src="${experience.companyLogo.originalImage.downloadUrl}" alt="Company Logo" style="width: 60px; height: 60px; border-radius: 8px; object-fit: contain;">
          ` : ''}
          <div style="flex: 1;">
            <div style="font-size: 18px; font-weight: 600; color: #333; margin-bottom: 4px;">
              ${experience.title?.localized?.en_US || experience.title?.localized?.[Object.keys(experience.title.localized)[0]] || 'Position'}
              <span class="tooltip-icon" data-tooltip-text="API: /identityMe
Field: primaryCurrentPosition.title.localized">ⓘ</span>
            </div>
            <div style="font-size: 14px; color: #666; margin-bottom: 4px;">
              ${experience.companyName?.localized?.en_US || experience.companyName?.localized?.[Object.keys(experience.companyName.localized)[0]] || ''}
              <span class="tooltip-icon" data-tooltip-text="API: /identityMe
Field: primaryCurrentPosition.companyName.localized">ⓘ</span>
            </div>
            ${experience.startedOn ? `
              <div style="font-size: 12px; color: #999;">
                Started: ${experience.startedOn.month || ''}${experience.startedOn.month && experience.startedOn.year ? '/' : ''}${experience.startedOn.year || ''}
                <span class="tooltip-icon" data-tooltip-text="API: /identityMe
Field: primaryCurrentPosition.startedOn">ⓘ</span>
              </div>
            ` : ''}
          </div>
        </div>
      </div>
    </div>
    ` : ''}
    
    <div class="api-section">
      <h2 class="api-title">📋 API Response</h2>
      
      <div class="collapsible">
        <div class="collapsible-header" onclick="toggleCollapsible(this)">
          <span class="collapsible-header-title">Profile Information</span>
          <span class="collapsible-chevron">▼</span>
        </div>
        <div class="collapsible-content">
          <pre>${JSON.stringify(profileInfo, null, 2)}</pre>
        </div>
      </div>
      
      <div class="collapsible">
        <div class="collapsible-header" onclick="toggleCollapsible(this)">
          <span class="collapsible-header-title">Verification Report</span>
          <span class="collapsible-chevron">▼</span>
        </div>
        <div class="collapsible-content">
          <pre>${JSON.stringify(verificationReport, null, 2)}</pre>
        </div>
      </div>
    </div>
    
    <div class="tutorial-section">
      <div class="tutorial-header" onclick="toggleTutorial()" style="cursor: pointer; user-select: none;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <div>
            <h2 class="tutorial-title">🔐 Integration Steps and Commands</h2>
            <p class="tutorial-subtitle" style="margin-left: 32px;">Learn how this integration works behind the scenes</p>
          </div>
          <span class="collapsible-chevron" id="tutorial-chevron" style="font-size: 24px; margin-left: 16px;">▼</span>
        </div>
      </div>
      
      <div class="collapsible-content" id="tutorial-content">
        ${tutorialData}
      </div>
    </div>
    
    <div style="text-align: center; margin-top: 32px; padding-bottom: 32px;">
      <a href="/" class="btn" style="display: inline-block; text-decoration: none;">⬅️ Back to Homepage</a>
    </div>
  </div>
  
  <script>
    function toggleCollapsible(header) {
      const content = header.nextElementSibling;
      const chevron = header.querySelector('.collapsible-chevron');
      
      content.classList.toggle('open');
      chevron.classList.toggle('open');
    }
    
    function toggleDetail(header) {
      const content = header.nextElementSibling;
      const chevron = header.querySelector('.detail-chevron');
      
      content.classList.toggle('open');
      chevron.classList.toggle('open');
    }
    
    function toggleTutorial() {
      const content = document.getElementById('tutorial-content');
      const chevron = document.getElementById('tutorial-chevron');
      
      content.classList.toggle('open');
      chevron.classList.toggle('open');
    }
  </script>
</body>
</html>`;
}

module.exports = { getProfilePage };
