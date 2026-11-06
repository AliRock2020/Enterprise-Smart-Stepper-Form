let currentStep = 1;
const totalSteps = 4;
let attachedFile = null;

// عناصر الواجهة
const steps = document.querySelectorAll('.step-content');
const stepItems = document.querySelectorAll('.step-item');
const progressFill = document.getElementById('progressFill');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const wizardForm = document.getElementById('wizardForm');
const successState = document.getElementById('successState');

// عناصر الـ Dropzone
const dropzone = document.getElementById('dropzone');
const fileInput = document.getElementById('fileInput');
const filePreviewList = document.getElementById('filePreviewList');
const fileUploadError = document.getElementById('fileUploadError');

// 1. تحديث شكل وشريط المراحل (Stepper State)
function updateStepper() {
  steps.forEach((step, index) => {
    step.classList.toggle('active', index + 1 === currentStep);
  });

  stepItems.forEach((item, index) => {
    const stepNum = index + 1;
    item.classList.remove('active', 'completed');
    if (stepNum === currentStep) {
      item.classList.add('active');
    } else if (stepNum < currentStep) {
      item.classList.add('completed');
    }
  });

  // حساب نسبة ملء شريط التقدم
  const fillPercent = ((currentStep - 1) / (totalSteps - 1)) * 100;
  progressFill.style.width = `${fillPercent}%`;

  // ضبط حالة الأزرار
  prevBtn.disabled = (currentStep === 1);
  if (currentStep === totalSteps) {
    nextBtn.className = 'btn btn-success px-4';
    nextBtn.innerHTML = '<i class="bi bi-check-circle me-1"></i> اعتماد وإرسال الطلب';
  } else {
    nextBtn.className = 'btn btn-primary px-4';
    nextBtn.innerHTML = 'التالي <i class="bi bi-arrow-left ms-1"></i>';
  }
}

// 2. التحقق من صحة مدخلات الخطوة الحالية
function validateCurrentStep() {
  const currentContainer = document.getElementById(`step${currentStep}`);
  let isValid = true;

  if (currentStep === 1) {
    const fullName = document.getElementById('fullName');
    const nationalId = document.getElementById('nationalId');
    const email = document.getElementById('email');
    const phone = document.getElementById('phone');

    // تحقق الاسم
    if (fullName.value.trim().length < 8) {
      fullName.classList.add('is-invalid');
      isValid = false;
    } else {
      fullName.classList.remove('is-invalid');
    }

    // تحقق الرقم القومي
    const nidVal = nationalId.value.trim();
    if (nidVal.length !== 14 || isNaN(nidVal)) {
      nationalId.classList.add('is-invalid');
      isValid = false;
    } else {
      nationalId.classList.remove('is-invalid');
    }

    // تحقق البريد
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.value.trim())) {
      email.classList.add('is-invalid');
      isValid = false;
    } else {
      email.classList.remove('is-invalid');
    }

    // تحقق الهاتف
    if (phone.value.trim().length < 10) {
      phone.classList.add('is-invalid');
      isValid = false;
    } else {
      phone.classList.remove('is-invalid');
    }
  } 
  else if (currentStep === 2) {
    const orgName = document.getElementById('orgName');
    const empCode = document.getElementById('empCode');
    const jobGroup = document.getElementById('jobGroup');
    const yearsExp = document.getElementById('yearsExp');

    [orgName, empCode, jobGroup, yearsExp].forEach(input => {
      if (!input.value.trim()) {
        input.classList.add('is-invalid');
        isValid = false;
      } else {
        input.classList.remove('is-invalid');
      }
    });
  } 
  else if (currentStep === 3) {
    if (!attachedFile) {
      fileUploadError.classList.remove('d-none');
      isValid = false;
    } else {
      fileUploadError.classList.add('d-none');
    }
  } 
  else if (currentStep === 4) {
    const termsCheck = document.getElementById('termsCheck');
    if (!termsCheck.checked) {
      termsCheck.classList.add('is-invalid');
      isValid = false;
    } else {
      termsCheck.classList.remove('is-invalid');
    }
  }

  return isValid;
}

// 3. تجميع ونقل البيانات إلى شاشة المراجعة
function populateReview() {
  document.getElementById('revFullName').innerText = document.getElementById('fullName').value;
  document.getElementById('revNationalId').innerText = document.getElementById('nationalId').value;
  document.getElementById('revContact').innerText = `${document.getElementById('email').value} | ${document.getElementById('phone').value}`;
  document.getElementById('revOrg').innerText = `${document.getElementById('orgName').value} (${document.getElementById('empCode').value})`;
  document.getElementById('revJob').innerText = `${document.getElementById('jobGroup').value} - خبرة ${document.getElementById('yearsExp').value} سنوات`;
  document.getElementById('revFile').innerText = attachedFile ? `${attachedFile.name} (${(attachedFile.size / (1024 * 1024)).toFixed(2)} MB)` : 'لا يوجد';
}

// 4. إدارة سحب وإفلات وتحميل الملفات
dropzone.addEventListener('click', () => fileInput.click());

dropzone.addEventListener('dragover', (e) => {
  e.preventDefault();
  dropzone.classList.add('dragover');
});

dropzone.addEventListener('dragleave', () => dropzone.classList.remove('dragover'));

dropzone.addEventListener('drop', (e) => {
  e.preventDefault();
  dropzone.classList.remove('dragover');
  if (e.dataTransfer.files.length > 0) {
    handleFile(e.dataTransfer.files[0]);
  }
});

fileInput.addEventListener('change', (e) => {
  if (e.target.files.length > 0) {
    handleFile(e.target.files[0]);
  }
});

function handleFile(file) {
  if (file.type !== 'application/pdf') {
    alert('عفواً، يقبل النظام ملفات PDF فقط.');
    return;
  }
  if (file.size > 5 * 1024 * 1024) {
    alert('حجم الملف يتجاوز الحد الأقصى المسموح به (5MB).');
    return;
  }

  attachedFile = file;
  fileUploadError.classList.add('d-none');

  filePreviewList.innerHTML = `
    <div class="file-preview-card mt-3">
      <div class="d-flex align-items-center gap-2">
        <i class="bi bi-file-earmark-pdf-fill text-danger fs-3"></i>
        <div>
          <div class="fw-semibold text-dark small">${file.name}</div>
          <small class="text-muted">${(file.size / (1024 * 1024)).toFixed(2)} MB</small>
        </div>
      </div>
      <button type="button" class="btn btn-sm btn-outline-danger" onclick="removeFile()">
        <i class="bi bi-trash"></i>
      </button>
    </div>
  `;
}

window.removeFile = function () {
  attachedFile = null;
  fileInput.value = '';
  filePreviewList.innerHTML = '';
};

// 5. أحداث التنقل
nextBtn.addEventListener('click', () => {
  if (!validateCurrentStep()) return;

  if (currentStep < totalSteps) {
    currentStep++;
    if (currentStep === 4) populateReview();
    updateStepper();
  } else {
    // اكتمال التسجيل النهائي
    document.querySelector('.wizard-card').classList.add('d-none');
    document.querySelector('.text-center.mb-4').classList.add('d-none');
    successState.classList.remove('d-none');
    document.getElementById('trackingCode').innerText = `REQ-${Date.now().toString().slice(-6)}`;
  }
});

prevBtn.addEventListener('click', () => {
  if (currentStep > 1) {
    currentStep--;
    updateStepper();
  }
});

// التشغيل الأولي
updateStepper();