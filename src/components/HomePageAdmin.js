import React, { Component } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import { useNavigate } from "react-router-dom";

class HomePage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      activeSubmenu: null,
      inactivityTimer: null
    };
    
    // Timeout configuration (in milliseconds)
    this.INACTIVITY_TIMEOUT = 30 * 60 * 1000; // 30 minutes
  }

  componentDidMount() {
    // Set up event listeners for user activity
    this.resetInactivityTimer();
    window.addEventListener('mousemove', this.resetInactivityTimer);
    window.addEventListener('keydown', this.resetInactivityTimer);
  }

  componentWillUnmount() {
    // Clean up event listeners and timer
    window.removeEventListener('mouseMove', this.resetInactivityTimer);
    window.removeEventListener('keydown', this.resetInactivityTimer);
    
    if (this.state.inactivityTimer) {
      clearTimeout(this.state.inactivityTimer);
    }
  }

  resetInactivityTimer = () => {
    // Clear existing timer
    if (this.state.inactivityTimer) {
      clearTimeout(this.state.inactivityTimer);
    }

    // Set new timer
    const newTimer = setTimeout(() => {
      this.handleSignOut('Session timeout due to inactivity');
    }, this.INACTIVITY_TIMEOUT);

    this.setState({ inactivityTimer: newTimer });
  }

  toggleSubmenu = (menu) => {
    this.setState({
      activeSubmenu: this.state.activeSubmenu === menu ? null : menu
    });
  };

  handleSignOut = (message = 'Signed out successfully') => {
    // Clear any authentication tokens or user session data
    // For example:
    localStorage.removeItem('authToken');
    sessionStorage.removeItem('userSession');

    // Use navigate prop to redirect to SignIn page
    const { navigate } = this.props;
    
    // Optional: Show a toast or alert about sign out reason
    ///alert(message);

    // Navigate to SignIn page, replacing current history entry
    // This prevents going back to the previous page
    navigate('/SignIn', { replace: true });
  }

  render() {
    const { activeSubmenu } = this.state;
    const { navigate } = this.props; // Access navigate from props
    
    return (
      <div className="container-fluid">
        {/* Custom CSS for animations and modern styling */}
        <style>
          {`
            /* Variables for theming */
            :root {
              --sidebar-bg: #2c3e50;
              --sidebar-accent: #3498db;
              --sidebar-hover: #34495e;
              --sidebar-text: #ecf0f1;
              --accent-green: #2ecc71;
              --accent-orange: #e67e22;
              --accent-red: #e74c3c;
              --accent-purple: #9b59b6;
            }

            /* Sidebar styling */
            .sidebar {
              background: var(--sidebar-bg);
              transition: all 0.3s ease;
              box-shadow: 0 0 15px rgba(0, 0, 0, 0.1);
            }

            /* Menu item styling */
            .menu-item {
              border-radius: 8px;
              margin: 5px 0;
              transition: all 0.3s ease;
              position: relative;
              overflow: hidden;
            }

            .menu-item:hover {
              background-color: var(--sidebar-hover);
              transform: translateX(5px);
            }

            .menu-item:before {
              content: '';
              position: absolute;
              left: 0;
              top: 0;
              height: 100%;
              width: 4px;
              background-color: var(--sidebar-accent);
              transform: scaleY(0);
              transition: transform 0.2s ease;
            }

            .menu-item:hover:before {
              transform: scaleY(1);
            }

            /* Active state styling */
            .menu-item.active {
              background-color: rgba(52, 152, 219, 0.2);
            }

            /* Submenu animations */
            .submenu {
              max-height: 0;
              overflow: hidden;
              transition: max-height 0.4s ease-in-out;
            }

            .submenu.open {
              max-height: 500px;
            }

            .submenu-item {
              transform: translateX(-10px);
              opacity: 0;
              transition: all 0.3s ease;
            }

            .submenu.open .submenu-item {
              transform: translateX(0);
              opacity: 1;
            }

            /* Submenu delay for cascade effect */
            .submenu-item:nth-child(1) { transition-delay: 0.05s; }
            .submenu-item:nth-child(2) { transition-delay: 0.1s; }
            .submenu-item:nth-child(3) { transition-delay: 0.15s; }
            .submenu-item:nth-child(4) { transition-delay: 0.2s; }

            /* Icon styling and animations */
            .nav-icon {
              transition: all 0.3s ease;
            }

            .menu-item:hover .nav-icon {
              transform: scale(1.2);
            }

            /* Chevron animation */
            .chevron-icon {
              transition: transform 0.3s ease;
            }

            .menu-item.active .chevron-icon {
              transform: rotate(180deg);
            }

            /* Feature indicators */
            .feature-dot {
              width: 8px;
              height: 8px;
              border-radius: 50%;
              display: inline-block;
              margin-right: 6px;
            }

            /* User profile section animation */
            .user-profile {
              transition: all 0.3s ease;
            }

            .user-profile:hover {
              background: rgba(255, 255, 255, 0.1);
              border-radius: 8px;
            }
            
            .user-avatar {
              transition: all 0.3s ease;
            }
            
            .user-profile:hover .user-avatar {
              transform: scale(1.1);
              box-shadow: 0 0 10px rgba(236, 240, 241, 0.5);
            }

            /* Custom scrollbar */
            .sidebar-scroll {
              scrollbar-width: thin;
              scrollbar-color: var(--sidebar-accent) var(--sidebar-bg);
            }
            
            .sidebar-scroll::-webkit-scrollbar {
              width: 6px;
            }
            
            .sidebar-scroll::-webkit-scrollbar-track {
              background: var(--sidebar-bg);
            }
            
            .sidebar-scroll::-webkit-scrollbar-thumb {
              background-color: var(--sidebar-accent);
              border-radius: 6px;
            }

            /* Badge styling */
            .status-badge {
              transition: all 0.3s ease;
            }
            
            .menu-item:hover .status-badge {
              transform: scale(1.1);
            }

            /* Responsive behavior */
            @media (max-width: 768px) {
              .menu-item:hover {
                transform: translateX(0);
              }
              
              .sidebar {
                width: 60px !important;
              }
            }
          `}
        </style>

        <div className="row flex-nowrap">
          {/* Sidebar */}
          <div className="col-auto col-md-3 col-xl-2 px-0 sidebar">
            <div className="d-flex flex-column align-items-center align-items-sm-start pt-2 text-white min-vh-100 sidebar-scroll">
              {/* Logo/Brand */}
              <a href="/" className="d-flex align-items-center py-3 mb-md-0 mt-md-0 me-md-auto text-white text-decoration-none ps-3 pe-3 w-100">
                <span className="fs-4 fw-bolder d-none d-sm-inline">
                  <span style={{ color: "#3498db" }}>Pro</span>
                  <span style={{ color: "#ecf0f1" }}>Dash</span>
                </span>
                <span className="fs-4 fw-bolder d-inline d-sm-none text-center w-100" style={{ color: "#3498db" }}>PD</span>
              </a>
              <hr className="dropdown-divider border-top border-secondary opacity-25 w-100 mb-2" />
              
              {/* Main Navigation */}
              <ul className="nav nav-pills flex-column mb-sm-auto mb-0 align-items-center align-items-sm-start w-100 px-2" id="menu">
                {/* Home */}
                <li className="nav-item w-100">
                  <a href="#" className="nav-link d-flex align-items-center text-white py-2 px-3 menu-item active">
                    <i className="fs-5 bi-house-door nav-icon text-info me-2"></i>
                    <span className="ms-1 d-none d-sm-inline">Home</span>
                    <span className="status-badge badge bg-success ms-auto d-none d-sm-flex">4</span>
                  </a>
                </li>
                
                {/* Employee */}
                <li className="nav-item w-100">
                  <a 
                    href="#" 
                    className={`nav-link d-flex align-items-center text-white py-2 px-3 menu-item ${activeSubmenu === 'dashboard' ? 'active' : ''}`}
                    onClick={(e) => {
                      e.preventDefault();
                      this.toggleSubmenu('dashboard');
                      navigate("/Employee"); // Using navigate from props
                    }}
                  >
                    <i className="fs-5 bi-speedometer2 nav-icon text-primary me-2"></i>
                    <span className="ms-1 d-none d-sm-inline">Employee</span>
                    <i className={`bi-chevron-down ms-auto d-none d-sm-inline chevron-icon ${activeSubmenu === 'dashboard' ? 'rotate-180' : ''}`}></i>
                  </a>
                  <ul className={`nav flex-column ms-1 ps-4 ${activeSubmenu === 'dashboard' ? 'submenu open' : 'submenu'}`}>
                    <li className="w-100 py-1 submenu-item">
                      <a href="#" className="nav-link py-1 text-white-50 d-flex align-items-center">
                        <span className="feature-dot" style={{ backgroundColor: "#3498db" }}></span>
                        <span className="d-none d-sm-inline">Analytics</span>
                      </a>
                    </li>
                    <li className="w-100 py-1 submenu-item">
                      <a href="#" className="nav-link py-1 text-white-50 d-flex align-items-center">
                        <span className="feature-dot" style={{ backgroundColor: "#2ecc71" }}></span>
                        <span className="d-none d-sm-inline">Reports</span>
                      </a>
                    </li>
                    <li className="w-100 py-1 submenu-item">
                      <a href="#" className="nav-link py-1 text-white-50 d-flex align-items-center">
                        <span className="feature-dot" style={{ backgroundColor: "#e74c3c" }}></span>
                        <span className="d-none d-sm-inline">Metrics</span>
                        <span className="status-badge badge bg-danger ms-auto d-none d-sm-flex">New</span>
                      </a>
                    </li>
                  </ul>
                </li>
                
                {/* Worker */}
                <li className="nav-item w-100">
                  <a 
                    href="#" 
                    className={`nav-link d-flex align-items-center text-white py-2 px-3 menu-item ${activeSubmenu === 'dashboard' ? 'active' : ''}`}
                    onClick={(e) => {
                      e.preventDefault();
                      this.toggleSubmenu('dashboard');
                      navigate("/Worker"); // Using navigate from props
                    }}
                  >
                    <i className="fs-5 bi-speedometer2 nav-icon text-primary me-2"></i>
                    <span className="ms-1 d-none d-sm-inline">Worker</span>
                    <i className={`bi-chevron-down ms-auto d-none d-sm-inline chevron-icon ${activeSubmenu === 'dashboard' ? 'rotate-180' : ''}`}></i>
                  </a>
                  <ul className={`nav flex-column ms-1 ps-4 ${activeSubmenu === 'dashboard' ? 'submenu open' : 'submenu'}`}>
                    <li className="w-100 py-1 submenu-item">
                      <a href="#" className="nav-link py-1 text-white-50 d-flex align-items-center">
                        <span className="feature-dot" style={{ backgroundColor: "#3498db" }}></span>
                        <span className="d-none d-sm-inline">Analytics</span>
                      </a>
                    </li>
                    <li className="w-100 py-1 submenu-item">
                      <a href="#" className="nav-link py-1 text-white-50 d-flex align-items-center">
                        <span className="feature-dot" style={{ backgroundColor: "#2ecc71" }}></span>
                        <span className="d-none d-sm-inline">Reports</span>
                      </a>
                    </li>
                    <li className="w-100 py-1 submenu-item">
                      <a href="#" className="nav-link py-1 text-white-50 d-flex align-items-center">
                        <span className="feature-dot" style={{ backgroundColor: "#e74c3c" }}></span>
                        <span className="d-none d-sm-inline">Metrics</span>
                        <span className="status-badge badge bg-danger ms-auto d-none d-sm-flex">New</span>
                      </a>
                    </li>
                  </ul>
                </li>
                
                {/* JobSection */}
                <li className="nav-item w-100">
                  <a 
                    href="#" 
                    className={`nav-link d-flex align-items-center text-white py-2 px-3 menu-item ${activeSubmenu === 'dashboard' ? 'active' : ''}`}
                    onClick={(e) => {
                      e.preventDefault();
                      this.toggleSubmenu('dashboard');
                      navigate("/JobSection"); // Using navigate from props
                    }}
                  >
                    <i className="fs-5 bi-speedometer2 nav-icon text-primary me-2"></i>
                    <span className="ms-1 d-none d-sm-inline">Job Section</span>
                    <i className={`bi-chevron-down ms-auto d-none d-sm-inline chevron-icon ${activeSubmenu === 'dashboard' ? 'rotate-180' : ''}`}></i>
                  </a>
                  <ul className={`nav flex-column ms-1 ps-4 ${activeSubmenu === 'dashboard' ? 'submenu open' : 'submenu'}`}>
                    <li className="w-100 py-1 submenu-item">
                      <a href="#" className="nav-link py-1 text-white-50 d-flex align-items-center">
                        <span className="feature-dot" style={{ backgroundColor: "#3498db" }}></span>
                        <span className="d-none d-sm-inline">Analytics</span>
                      </a>
                    </li>
                    <li className="w-100 py-1 submenu-item">
                      <a href="#" className="nav-link py-1 text-white-50 d-flex align-items-center">
                        <span className="feature-dot" style={{ backgroundColor: "#2ecc71" }}></span>
                        <span className="d-none d-sm-inline">Reports</span>
                      </a>
                    </li>
                    <li className="w-100 py-1 submenu-item">
                      <a href="#" className="nav-link py-1 text-white-50 d-flex align-items-center">
                        <span className="feature-dot" style={{ backgroundColor: "#e74c3c" }}></span>
                        <span className="d-none d-sm-inline">Metrics</span>
                        <span className="status-badge badge bg-danger ms-auto d-none d-sm-flex">New</span>
                      </a>
                    </li>
                  </ul>
                </li>
                {/* Employee */}
                <li className="nav-item w-100">
                  <a 
                    href="#" 
                    className={`nav-link d-flex align-items-center text-white py-2 px-3 menu-item ${activeSubmenu === 'dashboard' ? 'active' : ''}`}
                    onClick={(e) => {
                      e.preventDefault();
                      this.toggleSubmenu('dashboard');
                      navigate("/Salary"); // Using navigate from props
                    }}
                  ><i className="fs-5 bi-speedometer2 nav-icon text-primary me-2"></i>
                  <span className="ms-1 d-none d-sm-inline">Salary</span>
                  <i className={`bi-chevron-down ms-auto d-none d-sm-inline chevron-icon ${activeSubmenu === 'dashboard' ? 'rotate-180' : ''}`}></i>
                  </a>
                    
                  
                  
                </li>
                
                {/* Bonus */}
                <li className="nav-item w-100">
                  <a 
                    href="#" 
                    className={`nav-link d-flex align-items-center text-white py-2 px-3 menu-item ${activeSubmenu === 'Bonus' ? 'active' : ''}`}
                    onClick={(e) => {
                      e.preventDefault();
                      this.toggleSubmenu('Bonus');
                    }}
                  >
                    <i className="fs-5 bi-grid nav-icon text-warning me-2" style={{ color: "#e67e22" }}></i>
                    <span className="ms-1 d-none d-sm-inline">Bonus</span>
                    <i className={`bi-chevron-down ms-auto d-none d-sm-inline chevron-icon ${activeSubmenu === 'Bonus' ? 'rotate-180' : ''}`}></i>
                  </a>
                  <ul className={`nav flex-column ms-1 ps-4 ${activeSubmenu === 'Bonus' ? 'submenu open' : 'submenu'}`}>
                    <li className="w-100 py-1 submenu-item">
                      <a href="#" className="nav-link py-1 text-white-50 d-flex align-items-center" onClick={(e) => {
                      e.preventDefault();
                      this.toggleSubmenu('dashboard');
                      navigate("/BonusType"); // Using navigate from props
                    }}>
                        <span className="feature-dot" style={{ backgroundColor: "#e67e22" }}></span>
                        <span className="d-none d-sm-inline">Bonus Type</span>
                      </a>
                    </li>
                    <li className="w-100 py-1 submenu-item">
                      <a href="#" className="nav-link py-1 text-white-50 d-flex align-items-center" onClick={() => navigate("/BonusEid")}>
                        <span className="feature-dot" style={{ backgroundColor: "#e67e22" }}></span>
                        <span className="d-none d-sm-inline">Eid Bonus</span>
                      </a>
                    </li>
                    <li className="w-100 py-1 submenu-item">
                      <a href="#" className="nav-link py-1 text-white-50 d-flex align-items-center" onClick={() => navigate("/LeaveTyp")}>
                        <span className="feature-dot" style={{ backgroundColor: "#e67e22" }}></span>
                        <span className="d-none d-sm-inline">Leave Type</span>
                      </a>
                    </li>
                    {/* <li className="w-100 py-1 submenu-item">
                      <a href="#" className="nav-link py-1 text-white-50 d-flex align-items-center" onClick={() => navigate("/LeaveEntry")}>
                        <span className="feature-dot" style={{ backgroundColor: "#e67e22" }}></span>
                        <span className="d-none d-sm-inline">Leave Entry</span>
                        <span className="status-badge badge bg-info ms-auto d-none d-sm-flex">Sale</span>
                      </a>
                    </li> */}
                  </ul>
                </li>
                
                {/* Wages */}
                <li className="nav-item w-100">
                  <a 
                    href="#" 
                    className={`nav-link d-flex align-items-center text-white py-2 px-3 menu-item ${activeSubmenu === 'Wages' ? 'active' : ''}`}
                    onClick={(e) => {
                      e.preventDefault();
                      this.toggleSubmenu('Wages');
                    }}
                  >
                    <i className="fs-5 bi-grid nav-icon text-warning me-2" style={{ color: "#e67e22" }}></i>
                    <span className="ms-1 d-none d-sm-inline">Wages</span>
                    <i className={`bi-chevron-down ms-auto d-none d-sm-inline chevron-icon ${activeSubmenu === 'Wages' ? 'rotate-180' : ''}`}></i>
                  </a>
                  <ul className={`nav flex-column ms-1 ps-4 ${activeSubmenu === 'Wages' ? 'submenu open' : 'submenu'}`}>
                    
                    <li className="w-100 py-1 submenu-item">
                      <a href="#" className="nav-link py-1 text-white-50 d-flex align-items-center" onClick={() => navigate("/Wages")}>
                        <span className="feature-dot" style={{ backgroundColor: "#e67e22" }}></span>
                        <span className="d-none d-sm-inline">Wages</span>
                      </a>
                    </li>
                    <li className="w-100 py-1 submenu-item">
                      <a href="#" className="nav-link py-1 text-white-50 d-flex align-items-center" onClick={() => navigate("/WagesSlip")}>
                        <span className="feature-dot" style={{ backgroundColor: "#e67e22" }}></span>
                        <span className="d-none d-sm-inline">Wages Slip</span>
                      </a>
                    </li>
                    
                  </ul>
                </li>

                
                
                {/* OverTime */}
                <li className="nav-item w-100">
                  <a href="#" className="nav-link d-flex align-items-center text-white py-2 px-3 menu-item" onClick={() => navigate("/OverTime")}>
                    <i className="fs-5 bi-people nav-icon text-danger me-2"></i>
                    <span className="ms-1 d-none d-sm-inline">Over Time</span>
                  </a>
                </li>


              </ul>
              
              {/* User Profile Section */}
              <hr className="dropdown-divider border-top border-secondary opacity-25 w-100 mt-auto" />
              <div className="dropdown pb-4 w-100 px-3">
                <a href="#" className="d-flex align-items-center text-white text-decoration-none dropdown-toggle py-2 user-profile px-2" 
                   id="dropdownUser1" data-bs-toggle="dropdown" aria-expanded="false">
                  <img src="https://github.com/mdo.png" alt="user avatar" width="38" height="38" 
                       className="rounded-circle border border-light me-2 user-avatar" />
                  <span className="d-none d-sm-inline fw-semibold">Sayeed</span>
                  <span className="ms-auto d-none d-sm-inline"><i className="bi-chevron-down"></i></span>
                </a>
                <ul className="dropdown-menu dropdown-menu-dark text-small shadow-lg animate__animated animate__fadeIn" aria-labelledby="dropdownUser1">
          {/* ... other dropdown items ... */}
          <li>
            <a 
              className="dropdown-item" 
              href="#" 
              onClick={(e) => {
                e.preventDefault();
                this.handleSignOut();
              }}
            >
              <i className="bi-box-arrow-right me-2 text-danger"></i>Sign out
            </a>
          </li>
        </ul>
              </div>
            </div>
          </div>
          
          {/* Main Content */}
          <div className="col py-3">
            <div className="container">
              <div className="row mb-4">
                <div className="col-12">
                  <h3 className="fw-bold mb-3">Dashboard Overview</h3>
                  <p className="text-muted">
                    Welcome to your interactive dashboard with a modern, animated sidebar.
                  </p>
                </div>
              </div>
              
              <div className="row g-4 mb-4">
                <div className="col-md-6 col-lg-3">
                  <div className="card bg-primary text-white shadow-sm h-100">
                    <div className="card-body">
                      <h5 className="card-title">Revenue</h5>
                      <h3 className="mb-3">$24,750</h3>
                      <p className="card-text">
                        <span className="text-white-50">+12.6% from last month</span>
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="col-md-6 col-lg-3">
                  <div className="card bg-success text-white shadow-sm h-100">
                    <div className="card-body">
                      <h5 className="card-title">New Users</h5>
                      <h3 className="mb-3">728</h3>
                      <p className="card-text">
                        <span className="text-white-50">+8.3% from last week</span>
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="col-md-6 col-lg-3">
                  <div className="card bg-warning text-dark shadow-sm h-100">
                    <div className="card-body">
                      <h5 className="card-title">Orders</h5>
                      <h3 className="mb-3">432</h3>
                      <p className="card-text">
                        <span className="text-dark opacity-75">+17.2% from last week</span>
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="col-md-6 col-lg-3">
                  <div className="card bg-danger text-white shadow-sm h-100">
                    <div className="card-body">
                      <h5 className="card-title">Support Tickets</h5>
                      <h3 className="mb-3">16</h3>
                      <p className="card-text">
                        <span className="text-white-50">-3 from yesterday</span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="row">
                <div className="col-12">
                  <div className="card shadow-sm">
                    <div className="card-body">
                      <h5 className="card-title">About this sidebar</h5>
                      <p className="card-text">
                        This modern sidebar includes:
                      </p>
                      <ul>
                        <li><strong>Smooth animations</strong> on hover and menu transitions</li>
                        <li><strong>Colorful interface</strong> with semantic color coding</li>
                        <li><strong>Interactive elements</strong> including badges and indicators</li>
                        <li><strong>Fully responsive design</strong> that works on all screen sizes</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

// Wrapper function to provide navigation to the class component
const HomePageWithNavigation = (props) => {
  const navigate = useNavigate();
  return <HomePage {...props} navigate={navigate} />;
};

export default HomePageWithNavigation;