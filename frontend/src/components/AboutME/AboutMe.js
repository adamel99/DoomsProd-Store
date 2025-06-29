import React from "react";
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Avatar,
  Grid,
  Link as MuiLink,
  Button,
  useTheme,
} from "@mui/material";
import { Link } from "react-router-dom";

const AboutMe = () => {
  const theme = useTheme();

  const glassStyle = {
    backdropFilter: "blur(12px)",
    background: "rgba(255, 255, 255, 0.05)",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    borderRadius: 2,
    boxShadow: "0 12px 40px rgba(255, 64, 129, 0.12)",
  };
  const sections = [
    {
        title: "About Me",
        body: `I’m a multidisciplinary technologist with a passion for building experiences that live at the intersection of creativity, code, and security. With a background spanning full-stack development, audio plugin engineering, music production, and cybersecurity, I bring a holistic perspective to solving modern digital challenges — whether I’m architecting a web application, developing a VST/AU plugin, producing immersive audio environments, or hardening systems against evolving threats.`
    },
    {
        title: "👨‍🔧 Full-Stack Developer: Building Across the Stack",
        body: `As a full-stack developer, I specialize in designing and developing modern web applications that are scalable, secure, and user-focused. I’ve worked extensively with React, MySQL, Express, and a variety of frontend and backend frameworks to build efficient, clean solutions that work well across devices and use cases. My approach prioritizes seamless integration between the UI and backend systems, with attention to code quality, maintainability, and performance optimization.
        Whether developing interactive dashboards, building REST APIs, or deploying cloud-native infrastructure, I take pride in creating systems that are not only technically sound but also intuitive to use. I’m constantly exploring new tools, libraries, and best practices to stay ahead of the curve in an ever-evolving tech landscape.`
    },
    {
        title: "🎛️ Audio Plugin Development: Innovation Through Sound",
        body: ` I am currently in the works of creating my first professional plugin Aurora — an audio effect plugin designed for deep, expressive sound manipulation through granular synthesis. Built using the JUCE framework, Aurora empowers music producers, artists, and sound designers to modulate pitch, texture, and timing with fluid real-time control.
        Inspired by industry-defining tools like Portal I’ve engineered Aurora to deliver a responsive, high-quality sound-shaping experience that blends DSP performance with polished UX. Every line of DSP code, grain envelope, and visual feedback loop is written with the end-user in mind — musicians who want tools that disappear into their creative workflow.
        From optimizing FFT performance using FFTW to implementing intelligent thread management and real-time UI rendering, I take plugin development seriously — combining creative vision with deep technical implementation.`
    },
    {
        title: "🎶 Music Producer: Emotion in Every Frequency",
        body: `Outside of code, I’m also an active music producer with a catalog of beats inspired by artists of all genres including Jazz, RnB, Afrobeats, and Latin Pop. I specialize in producing emotionally driven instrumentals with rich harmonics, wide stereo imaging, and clean mixes that hold their own in professional playback environments.
        I publish beats consistently to YouTube, building a brand that merges musical emotion with technical quality. My production pipeline is informed by my plugin development skills — giving me an edge in sculpting truly unique sounds and understanding both the artist and engineer perspectives.`
    },
    {
        title: "🔐 Cybersecurity: Securing What I Build",
        body: ` As someone who builds systems, I’m equally invested in securing them. I’m currently advancing my cybersecurity expertise through a CompTIA Security+ program, where I’m sharpening my understanding of secure networking, operating system hardening, SIEMs, and modern threat landscapes.
        I believe modern technologists need to be just as familiar with firewalls, subnets, encryption, and access control as they are with APIs and front-end frameworks. My cybersecurity journey is fueled by a desire to build resilient systems from the ground up — whether it's secure-by-design web apps, hardened client environments, or understanding how attackers think so I can better defend against them.`
    },
  ];

  return (
    <Box
      sx={{
        backgroundColor: "#0d0d0d",
        minHeight: "100vh",
        py: 10,
        px: 2,
        color: "#f0f0f0",
      }}
    >
      <Container maxWidth="md">
        <Box display="flex" justifyContent="center" mb={6}>
          <Avatar
            alt="Your Portrait"
            src="/Images/selfie.jpg"
            sx={{
              width: 140,
              height: 140,
              border: "3px solid #ff4081",
              boxShadow: "0 4px 20px rgba(255, 64, 129, 0.5)",
            }}
          />
        </Box>

        <Grid container spacing={4}>
          {sections.map((section, idx) => (
            <Grid item xs={12} key={idx}>
              <Card sx={{ ...glassStyle, p: 4 }}>
                <CardContent>
                  <Typography
                    variant="h5"
                    fontWeight="bold"
                    sx={{
                      color: "#ff4081",
                      mb: 1,
                      textShadow: "0 2px 4px rgba(0,0,0,0.3)",
                    }}
                  >
                    {section.title}
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{
                      color: "#cccccc",
                      lineHeight: 1.75,
                    }}
                  >
                    {section.body}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Box mt={8} textAlign="center">
          <Typography sx={{ color: "#999", mb: 2 }}>
            Want to dive deeper? Check out my{" "}
            <MuiLink
              component={Link}
              to="/"
              underline="hover"
              sx={{ color: "#ff6699", fontWeight: "bold" }}
            >
              projects
            </MuiLink>{" "}
            or visit my{" "}
            <MuiLink
              href="https://github.com/adamel99"
              target="_blank"
              rel="noreferrer"
              sx={{ color: "#ff6699", fontWeight: "bold" }}
            >
              GitHub profile!
            </MuiLink>
          </Typography>

          <Button
            component={Link}
            to="/products"
            variant="contained"
            size="large"
            sx={{
              mt: 3,
              px: 5,
              py: 1.5,
              fontWeight: 700,
              borderRadius: 99,
              background: "linear-gradient(135deg, #ff4081, #ff6699)",
              boxShadow: "0 8px 30px rgba(255, 64, 129, 0.3)",
              "&:hover": {
                background: "linear-gradient(135deg, #ff6699, #ff4081)",
              },
            }}
          >
            Explore My Work
          </Button>
        </Box>
      </Container>
    </Box>
  );
};

export default AboutMe;
