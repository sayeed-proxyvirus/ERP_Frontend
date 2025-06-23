import React, { Component } from "react";
import { useNavigate } from "react-router-dom";
import "./SignIn.css";
import axios from "axios";

import {
  TextField,
  Radio,
  RadioGroup,
  FormControlLabel,
  Button,
  Snackbar,
  IconButton,
  ThemeProvider,
  createTheme,
  CssBaseline,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

// Create a dark theme for Material UI components
const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#8ab4f8',
    },
    secondary: {
      main: '#bb86fc',
    },
    background: {
      default: '#121212',
      paper: '#242424',
    },
    text: {
      primary: '#e0e0e0',
      secondary: '#b0b0b0',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    button: {
      textTransform: 'none',
    },
  },
  shape: {
    borderRadius: 4,
  },
  components: {
    MuiTextField: {
      defaultProps: {
        variant: 'outlined',
        fullWidth: true,
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 4,
          padding: '6px 16px',
        },
      },
    },
  },
});

// Create a class component wrapped with a function component to use hooks
class SignInClass extends Component {
  constructor(props) {
    super(props);
    this.state = {
      Radiovalue: "User",
      userName: "",
      userNameFlag: false,
      password: "",
      passwordFlag: false,
      open: false,
      Message: "",
    };
  }

  handleClose = (e, reason) => {
    if (reason === "clickaway") {
      return;
    }
    this.setState({ open: false });
  };

  handleRadioChange = (e) => {
    this.setState({ Radiovalue: e.target.value });
  };

  handleChange = (e) => {
    const { name, value } = e.target;
    this.setState({ [name]: value });
  };

  handleSignUp = (e) => {
    // Use the navigate prop passed from the wrapper component
    this.props.navigate("/");
  };

  CheckValidation() {
    console.log("CheckValidation Calling...");

    this.setState({ userNameFlag: false, passwordFlag: false });

    if (this.state.userName === "") {
      this.setState({ userNameFlag: true });
    }
    if (this.state.password === "") {
      this.setState({ passwordFlag: true });
    }
  }

  handleSubmit = (e) => {
    this.CheckValidation();
    if (this.state.userName !== "" && this.state.password !== "") {
      console.log("Acceptable");
      
      // Check if the user is attempting to login as Admin with specific credentials
      if (
        this.state.Radiovalue === "Admin" &&
        this.state.userName === "Sayeed" &&
        this.state.password === "123"
      ) {
        // Admin specific login path
        alert(`Welcome 'Admin ${this.state.userName}' !!`);
        console.log("Admin Login Successful");
        this.props.navigate("/HomePageAdmin");
        return; // Early return to avoid the regular authentication flow
      }
      
      // Regular authentication flow for non-admin users
      let data = {
        userName: this.state.userName,
        password: this.state.password,
        role: this.state.Radiovalue,
      };
      const url = "https://localhost:44353/api/CrudApplication/Login";
      axios
        .post(url, data)
        .then((result) => {
          alert(`Welcome '${this.state.userName}' !!`);
          console.log("Login Successful");
          this.props.navigate("/HomePageAdmin");
        })
        .catch((error) => {
          alert(error);
        });
    } else {
      console.log("Not Acceptable");
      this.setState({ open: true, Message: "Please Fill Mandatory Fields" });
    }
  };

  render() {
    return (
      <ThemeProvider theme={darkTheme}>
        <CssBaseline />
        <div className="SignUp-Container">
          <div className="SignUp-SubContainer">
            <div className="Header">Sign In</div>
            <div className="Body">
              <form className="form">
                <TextField
                  className="TextField"
                  name="userName"
                  label="Username"
                  variant="outlined"
                  size="small"
                  error={this.state.userNameFlag}
                  value={this.state.userName}
                  onChange={this.handleChange}
                  InputProps={{
                    style: { color: '#e0e0e0' }
                  }}
                />
                <TextField
                  className="TextField"
                  type="password"
                  name="password"
                  label="Password"
                  variant="outlined"
                  size="small"
                  error={this.state.passwordFlag}
                  value={this.state.password}
                  onChange={this.handleChange}
                  InputProps={{
                    style: { color: '#e0e0e0' }
                  }}
                />
                <RadioGroup
                  className="Roles"
                  name="Role"
                  value={this.state.Radiovalue}
                  onChange={this.handleRadioChange}
                  row
                >
                  <FormControlLabel
                    className="RoleValue"
                    value="Admin"
                    control={<Radio />}
                    label="Admin"
                  />
                  <FormControlLabel
                    className="RoleValue"
                    value="User"
                    control={<Radio />}
                    label="User"
                  />
                </RadioGroup>
              </form>
            </div>
            <div className="Buttons">
              <Button 
                className="Btn" 
                color="primary" 
                onClick={this.handleSignUp}
              >
                Sign Up
              </Button>
              <Button
                className="Btn"
                variant="contained"
                color="primary"
                onClick={this.handleSubmit}
              >
                Sign In
              </Button>
            </div>
          </div>
          <Snackbar
            anchorOrigin={{
              vertical: "bottom",
              horizontal: "left",
            }}
            open={this.state.open}
            autoHideDuration={6000}
            onClose={this.handleClose}
            message={this.state.Message}
            action={
              <React.Fragment>
                <Button color="secondary" size="small" onClick={this.handleClose}>
                  UNDO
                </Button>
                <IconButton
                  size="small"
                  aria-label="close"
                  color="inherit"
                  onClick={this.handleClose}
                >
                  <CloseIcon fontSize="small" />
                </IconButton>
              </React.Fragment>
            }
          />
        </div>
      </ThemeProvider>
    );
  }
}

// Wrapper function component to use the useNavigate hook
export default function SignIn() {
  const navigate = useNavigate();
  return <SignInClass navigate={navigate} />;
}