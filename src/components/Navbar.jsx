import React, { useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  useScrollTrigger,
  Slide,
} from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import { styled } from "@mui/system";
import MenuIcon from "@mui/icons-material/Menu";
import LoginIcon from "@mui/icons-material/Login";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import BookIcon from "@mui/icons-material/Book";
import ListIcon from "@mui/icons-material/List";
import PersonIcon from "@mui/icons-material/Person";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";

function HideOnScroll(props) {
  const { children } = props;
  const trigger = useScrollTrigger();
  return <Slide appear={false} direction="down" in={!trigger}>{children}</Slide>;
}

const StyledAppBar = styled(AppBar)({
  backgroundColor: "#FFFFFF",
  boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
  borderBottom: "1px solid #000000",
  padding: "8px 16px",
  "@media (max-width: 768px)": {
    padding: "12px 16px",
    position: "absolute",
  },
});

const Logo = styled(Typography)({
  flexGrow: 1,
  fontWeight: "bold",
  letterSpacing: "0.2rem",
  color: "#000000",
  textDecoration: "none",
  cursor: "pointer",
});

const NavButton = styled(Button)({
  marginLeft: "16px",
  marginRight: "16px",
  transition: "transform 0.3s ease, background-color 0.3s ease",
  textTransform: "none",
  color: "#000000",
  fontWeight: "500",
  "&:hover": {
    transform: "scale(1.05)",
    backgroundColor: "rgba(0, 0, 0, 0.05)",
  },
});

const MobileMenuButton = styled(IconButton)({
  display: "none",
  "@media (max-width: 1024px)": {
    display: "block",
    color: "#000",
  },
});

const DesktopMenu = styled(Box)({
  display: "flex",
  alignItems: "center",
  "@media (max-width: 1024px)": {
    display: "none",
  },
});

const Navbar = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    
    if (token && token.split(".").length === 3) {
      try {
        const decoded = jwtDecode(token);
        setIsLoggedIn(true);
        setIsAdmin(decoded.role === "admin");
      } catch (error) {
        console.error("ไม่สามารถถอดรหัส token ได้:", error);
        setIsLoggedIn(false);
        setIsAdmin(false);
      }
    } else {
      console.warn("Token ไม่มีหรือรูปแบบไม่ถูกต้อง:", token);
      setIsLoggedIn(false);
      setIsAdmin(false);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    setIsAdmin(false);
    navigate("/login");
    setTimeout(() => window.location.reload(), 100);
  };

  return (
    <>
      <HideOnScroll>
        <StyledAppBar position="fixed">
          <Toolbar>
            <Logo variant="h6" component={Link} to="/">
              CE
            </Logo>


            <DesktopMenu>
              {isLoggedIn ? (
                <>
                  <NavButton component={Link} to="/booking" startIcon={<BookIcon />}>
                    ห้อง
                  </NavButton>
                  <NavButton component={Link} to="/bookings" startIcon={<ListIcon />}>
                    ตรวจสอบคนใช้ห้อง
                  </NavButton>
                  {isAdmin && (
                    <NavButton component={Link} to="/admin" startIcon={<AdminPanelSettingsIcon />}>
                      Admin
                    </NavButton>
                  )}
                  <NavButton component={Link} to="/profile" startIcon={<PersonIcon />}>
                    โปรไฟล์
                  </NavButton>
                  <NavButton onClick={handleLogout} startIcon={<ExitToAppIcon />}>
                    ออกจากระบบ
                  </NavButton>
                </>
              ) : (
                <>
                  <NavButton component={Link} to="/login" startIcon={<LoginIcon />}>
                    เข้าสู่ระบบ
                  </NavButton>
                  <NavButton component={Link} to="/register" startIcon={<PersonAddIcon />}>
                    สมัครสมาชิก
                  </NavButton>
                </>
              )}
            </DesktopMenu>


            <MobileMenuButton aria-label="menu" onClick={() => setDrawerOpen(true)}>
              <MenuIcon />
            </MobileMenuButton>
          </Toolbar>
        </StyledAppBar>
      </HideOnScroll>


      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        sx={{ zIndex: 1500, width: "80vw", maxWidth: "300px" }}
      >
        <Box sx={{ width: "100%", padding: "16px" }} onClick={() => setDrawerOpen(false)}>
          <List>
            {!isLoggedIn ? (
              <>
                <ListItem button component={Link} to="/login">
                  <ListItemIcon><LoginIcon /></ListItemIcon>
                  <ListItemText primary="เข้าสู่ระบบ" />
                </ListItem>
                <ListItem button component={Link} to="/register">
                  <ListItemIcon><PersonAddIcon /></ListItemIcon>
                  <ListItemText primary="สมัครสมาชิก" />
                </ListItem>
              </>
            ) : (
              <>
                <ListItem button component={Link} to="/booking">
                  <ListItemIcon><BookIcon /></ListItemIcon>
                  <ListItemText primary="เข้าใช้ห้อง" />
                </ListItem>
                <ListItem button component={Link} to="/bookings">
                  <ListItemIcon><ListIcon /></ListItemIcon>
                  <ListItemText primary="ตรวจสอบผู้ใช้ห้อง" />
                </ListItem>
                {isAdmin && (
                  <ListItem button component={Link} to="/admin">
                    <ListItemIcon><AdminPanelSettingsIcon /></ListItemIcon>
                    <ListItemText primary="Admin" />
                  </ListItem>
                )}
                <ListItem button component={Link} to="/profile">
                  <ListItemIcon><PersonIcon /></ListItemIcon>
                  <ListItemText primary="โปรไฟล์" />
                </ListItem>
                <ListItem button onClick={handleLogout}>
                  <ListItemIcon><ExitToAppIcon /></ListItemIcon>
                  <ListItemText primary="ออกจากระบบ" />
                </ListItem>
              </>
            )}
          </List>
        </Box>
      </Drawer>
    </>
  );
};

export default Navbar;