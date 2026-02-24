// pages/About.jsx

import "./About.css";

export default function About() {
  return (
    <div className="about-container">
      <div className="about-card">

        {/* PROFILE SECTION */}
        <div className="about-profile">
          <img
            src="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgmzRwrOmit06T3yYAnXjr5FvaI9s1cUkk47E4UHhVtazweCoWbY-Z8RhIzthDgDOJ7h0Nx-g0UDziv0QwV72eHUwOP33VGR3gyOH8OzuSHZj9In7g1OpzZetj3Witp_y0XNY-Tvdm-CRXQA50rKMZMyClwvDI0vGamxI832k0anTmQzwsioHmXcFt2-lY/s1280/photo.jpeg"
            alt="Vikram Solanki"
            className="about-avatar"
          />

          <div className="about-basic">
            <h2>Vikram Solanki</h2>
            <p>📍 Jodhpur, Rajasthan</p>
            <p>🎓 B.E. – Artificial Intelligence and Data Science</p>
            <p>📅 Third Year Student</p>
          </div>
        </div>

        {/* DESCRIPTION */}
        <div className="about-section">
          <h3>👨‍💻 About Me</h3>
          <p>
            I am a passionate Full Stack Developer and Robotics Enthusiast
            who enjoys building intelligent, scalable, and real-world
            problem-solving systems. I love combining software engineering
            with embedded systems and AI technologies.
          </p>

          <p>
            My work focuses on React-based SaaS applications, Firebase
            backend systems, AI-integrated automation, and Micro controllers-based
            robotics solutions.
          </p>
        </div>

        {/* SKILLS */}
        <div className="about-section">
          <h3>🛠 Technical Skills</h3>

          <div className="skills-grid">
            <span>React.js</span>
            <span>Firebase</span>
            <span>JavaScript</span>
            <span>Node.js</span>
            <span>Python</span>
            <span>Machine Learning</span>
            <span>ESP32</span>
            <span>Arduino</span>
            <span>IoT</span>
            <span>Data Structures</span>
          </div>
        </div>

        

      </div>
    </div>
  );
}