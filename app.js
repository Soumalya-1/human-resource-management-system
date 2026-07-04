// ============================================================
// APP INITIALIZATION & VIEW ROUTING
// ============================================================
document.addEventListener("DOMContentLoaded", () => {
    // Auth switching
    document.getElementById("goToSignup").addEventListener("click", () => {
        document.getElementById("screen-signin").classList.add("hidden");
        document.getElementById("screen-signup").classList.remove("hidden");
    });

    document.getElementById("goToSignin").addEventListener("click", () => {
        document.getElementById("screen-signup").classList.add("hidden");
        document.getElementById("screen-signin").classList.remove("hidden");
    });

    // Simulated Login
    document.getElementById("signinForm").addEventListener("submit", (e) => {
        e.preventDefault();
        document.getElementById("screen-signin").classList.add("hidden");
        document.getElementById("app-shell").classList.remove("hidden");
    });
    
    // Logout
    document.getElementById("logoutBtn").addEventListener("click", () => {
        document.getElementById("app-shell").classList.add("hidden");
        document.getElementById("screen-signin").classList.remove("hidden");
        document.getElementById("userDropdown").classList.remove("open");
    });

    // Password Toggle
    document.querySelectorAll("[data-toggle-pw]").forEach(btn => {
        btn.addEventListener("click", (e) => {
            const inputId = e.currentTarget.getAttribute("data-toggle-pw");
            const input = document.getElementById(inputId);
            if(input.type === "password") {
                input.type = "text";
                e.currentTarget.style.color = "var(--brand)";
            } else {
                input.type = "password";
                e.currentTarget.style.color = "";
            }
        });
    });

    // Nav Routing
    document.querySelectorAll(".nav-link").forEach(link => {
        link.addEventListener("click", (e) => {
            document.querySelectorAll(".nav-link").forEach(l => l.classList.remove("active"));
            e.currentTarget.classList.add("active");
            switchView(e.currentTarget.getAttribute("data-target"));
        });
    });

    // Profile Tabs
    document.querySelectorAll(".tab").forEach(tab => {
        tab.addEventListener("click", (e) => {
            // Remove active classes
            e.currentTarget.parentElement.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
            document.querySelectorAll(".tab-panel").forEach(p => p.classList.add("hidden"));
            // Set active
            e.currentTarget.classList.add("active");
            document.getElementById(e.currentTarget.getAttribute("data-tab-target")).classList.remove("hidden");
        });
    });
    
    // Time Off Sub-view Tabs (Pills)
    document.querySelectorAll(".pill-tab").forEach(tab => {
        tab.addEventListener("click", (e) => {
            e.currentTarget.parentElement.querySelectorAll(".pill-tab").forEach(t => t.classList.remove("active"));
            document.querySelectorAll(".timeoff-subview").forEach(v => v.classList.add("hidden"));
            e.currentTarget.classList.add("active");
            document.getElementById(e.currentTarget.getAttribute("data-view-target")).classList.remove("hidden");
        });
    });

    // Avatar Dropdown
    const avatarBtn = document.getElementById("avatarBtn");
    const userDropdown = document.getElementById("userDropdown");
    avatarBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        userDropdown.classList.toggle("open");
    });
    document.addEventListener("click", () => {
        userDropdown.classList.remove("open");
    });

    // Check In Widget Logic
    const checkinBtn = document.getElementById("checkinBtn");
    const checkinDot = document.getElementById("checkinStatusDot");
    const checkinLabel = document.getElementById("checkinLabel");
    let isCheckedIn = false;

    checkinBtn.addEventListener("click", () => {
        isCheckedIn = !isCheckedIn;
        if(isCheckedIn) {
            checkinDot.classList.remove("out");
            checkinDot.classList.add("in");
            checkinLabel.textContent = "Check Out";
            showToast("Successfully checked in for the day.");
        } else {
            checkinDot.classList.remove("in");
            checkinDot.classList.add("out");
            checkinLabel.textContent = "Check In";
            showToast("Checked out. Have a great evening!");
        }
    });

    // Modal Events
    document.getElementById("openTimeOffModalBtn").addEventListener("click", () => {
        document.getElementById("timeOffModal").classList.add("open");
    });

    // Initial Salary Calc
    calculateSalaryComponents();

    // Listen for Salary Wage Changes
    document.getElementById("inputWage").addEventListener("input", calculateSalaryComponents);
});

// ============================================================
// GLOBAL FUNCTIONS
// ============================================================

window.switchView = function(viewId) {
    document.querySelectorAll(".view-panel").forEach(panel => {
        panel.classList.add("hidden");
    });
    document.getElementById(viewId).classList.remove("hidden");
    window.scrollTo(0, 0);
};

window.closeTimeOffModal = function() {
    document.getElementById("timeOffModal").classList.remove("open");
};

// ============================================================
// SALARY COMPUTATION LOGIC
// ============================================================
// Rules derived from Layout Screenshots:
// Basic = 50% of wage
// HRA = 50% of Basic
// Standard = Fixed 4167
// Performance = 8.33% of Basic
// LTA = 8.33% of Basic
// PF (Deduction) = 12% of Basic
// Fixed Allowance = Remaining balance to match Wage
function calculateSalaryComponents() {
    const wageStr = document.getElementById("inputWage").value;
    const wage = parseFloat(wageStr) || 0;
    
    // Yearly
    document.getElementById("inputYearly").value = (wage * 12).toFixed(2);
    
    // Standard config
    const stdAllowance = 4167.00;
    
    // Ratios
    const basic = wage * 0.50;
    const hra = basic * 0.50;
    const perf = basic * 0.0833;
    const lta = basic * 0.0833;
    
    // Remaining chunk
    const subtotal = basic + hra + stdAllowance + perf + lta;
    const fixed = wage - subtotal;
    
    // PF Deduction
    const pf = basic * 0.12;
    
    // Set Values
    document.getElementById("valBasic").value = basic.toFixed(2);
    document.getElementById("valHRA").value = hra.toFixed(2);
    document.getElementById("valStandard").value = stdAllowance.toFixed(2);
    document.getElementById("valPerformance").value = perf.toFixed(2);
    document.getElementById("valLTA").value = lta.toFixed(2);
    document.getElementById("valFixed").value = fixed > 0 ? fixed.toFixed(2) : "0.00";
    
    // Set Dynamic Percentages (Visual only based on total wage)
    document.getElementById("pctStandard").value = wage > 0 ? ((stdAllowance / wage) * 100).toFixed(2) : "0.00";
    document.getElementById("pctFixed").value = wage > 0 && fixed > 0 ? ((fixed / wage) * 100).toFixed(2) : "0.00";
    
    // Set totals
    document.getElementById("valGross").textContent = wage.toFixed(2);
    document.getElementById("valPF").value = pf.toFixed(2);
}

// ============================================================
// TOAST NOTIFICATIONS
// ============================================================
function showToast(msg) {
    let host = document.getElementById("toastHost");
    if(!host) {
        host = document.createElement("div");
        host.id = "toastHost";
        document.body.appendChild(host);
    }
    const toast = document.createElement("div");
    toast.className = "toast";
    toast.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg> ${msg}`;
    host.appendChild(toast);
    
    setTimeout(() => {
        toast.style.opacity = "0";
        setTimeout(() => toast.remove(), 200);
    }, 3000);
}

// ============================================================
// DYNAMIC PROFILE INJECTION
// ============================================================

// Dummy database of employees
const employeesDatabase = {
    'emp-1': {
        name: 'John Doe',
        initials: 'JD',
        color: '#2F6FA8',
        loginId: 'OIJODO20260001',
        email: 'john@company.com',
        mobile: '+91 98765 43210',
        dept: 'Engineering',
        manager: 'Aditi Rao',
        location: 'Mumbai, India'
    },
    'emp-2': {
        name: 'Aditi Rao',
        initials: 'AR',
        color: '#E0A93A',
        loginId: 'OIADRA20260002',
        email: 'aditi@company.com',
        mobile: '+91 98765 43211',
        dept: 'Product',
        manager: 'CEO',
        location: 'Mumbai, India'
    },
    'emp-3': {
        name: 'Sarah Mason',
        initials: 'SM',
        color: '#C1443F',
        loginId: 'OISAMA20260003',
        email: 'sarah@company.com',
        mobile: '+91 98765 43212',
        dept: 'Design',
        manager: 'Aditi Rao',
        location: 'Remote'
    }
};

window.openProfile = function(empId) {
    // 1. Get the data for the clicked employee
    const empData = employeesDatabase[empId];
    
    // 2. If the employee doesn't exist in our mock data, exit
    if (!empData) return; 

    // 3. Inject the data into the DOM elements we tagged with IDs
    document.getElementById('profileInitials').textContent = empData.initials;
    document.getElementById('profileAvatar').style.background = empData.color;
    document.getElementById('profileName').value = empData.name;
    document.getElementById('profileLoginId').textContent = empData.loginId;
    document.getElementById('profileEmail').value = empData.email;
    document.getElementById('profileMobile').value = empData.mobile;
    document.getElementById('profileDept').textContent = empData.dept;
    document.getElementById('profileManager').textContent = empData.manager;
    document.getElementById('profileLocation').textContent = empData.location;

    // 4. Switch the view to the profile panel
    switchView('view-profile');
};