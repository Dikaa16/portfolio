import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { API_URL } from '../config';

function Home() {
  const [experiences, setExperiences] = useState([]);
  const [projects, setProjects] = useState([]);
  const [education, setEducation] = useState([]);
  const [volunteer, setVolunteer] = useState([]);
  const [skills, setSkills] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedExperience, setExpandedExperience] = useState({});
  const [expandedEducation, setExpandedEducation] = useState({});
  const [expandedVolunteer, setExpandedVolunteer] = useState({});
  const [expandedProject, setExpandedProject] = useState({});
  const [expandedCourses, setExpandedCourses] = useState(false);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      const [expResponse, projResponse, skillsResponse, coursesResponse] = await Promise.all([
        axios.get(`${API_URL}/api/experience`),
        axios.get(`${API_URL}/api/projects`),
        axios.get(`${API_URL}/api/skills`),
        axios.get(`${API_URL}/api/courses`)
      ]);
      
      const allExperiences = expResponse.data;
      setExperiences(allExperiences.filter(exp => exp.type === 'work' && exp.featured));
      setEducation(allExperiences.filter(exp => exp.type === 'education' && exp.featured));
      setVolunteer(allExperiences.filter(exp => exp.type === 'volunteer' && exp.featured));
      setProjects(projResponse.data.filter(p => p.featured));
      setSkills(skillsResponse.data.filter(s => s.featured));
      setCourses(coursesResponse.data.filter(c => c.featured));
    } catch (error) {
      console.error('Error fetching data:', error);
      if (error.response?.status === 429) {
        setError('Too many requests. Please wait a moment and refresh the page.');
      } else {
        setError('Failed to load content. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  };

  const toggleExperience = (id) => {
    setExpandedExperience(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleEducation = (id) => {
    setExpandedEducation(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleVolunteer = (id) => {
    setExpandedVolunteer(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleProject = (id) => {
    setExpandedProject(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const getTechIcon = (tech) => {
    if (tech === "C#") return "/assets/icons/csharp.svg";
    return `/assets/icons/${tech.toLowerCase().replace(/[.\s]/g, '')}.svg`;
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 }
    }
  };

  if (loading) {
    return (
      <div className="page">
        <div className="loading">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page">
        <div className="empty-state">
          <h3>⚠️ {error}</h3>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* HERO SECTION */}
      <section className="hero">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="hero-content"
        >
          <motion.div className="hero-text" variants={itemVariants}>
            <h1 className="hero-title">
              Andika Sentosa <span className="accent">Putra</span>
            </h1>
            
            <p className="hero-description">
              Software engineer crafting elegant solutions. Based in Vancouver, 
              building digital experiences that matter.
            </p>

            <div className="hero-cta">
              <a href="#work-experience" className="btn btn-primary">View Experience</a>
              <a href="#projects" className="btn">View Projects</a>
            </div>
          </motion.div>

          <motion.div className="hero-photo" variants={itemVariants}>
            <div className="photo-wrapper">
              <img 
                src="https://res.cloudinary.com/dearql1iq/image/upload/v1770292355/Andika-speech_sy5ubk.png" 
                alt="Andika Sentosa Putra"
                onError={(e) => {
                  e.target.src = "https://ui-avatars.com/api/?name=Andika+Sentosa+Putra&size=400&background=d4af37&color=fff&bold=true";
                }}
              />
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* WORK EXPERIENCE SECTION */}
      <section id="work-experience" className="section">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="section-title">Work Experience</h2>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="experience-grid"
        >
          {experiences.length === 0 ? (
            <p style={{ textAlign: 'center', color: 'var(--text-light)', gridColumn: '1 / -1' }}>
              No featured work experience yet.
            </p>
          ) : (
            experiences.map((exp) => (
              <motion.div
                key={exp._id}
                className="experience-card"
                variants={itemVariants}
              >
                {exp.logoUrl && (
                  <div className="company-logo">
                    <img 
                      src={exp.logoUrl}
                      alt={exp.company}
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  </div>
                )}

                <h3>{exp.company}</h3>
                <p className="experience-role">{exp.title}</p>
                <p className="experience-meta">
                  {exp.location} • {exp.startDate} - {exp.endDate}
                </p>

                {exp.description && (
                  <p className="experience-description">{exp.description}</p>
                )}

                {exp.technologies && exp.technologies.length > 0 && (
                  <div className="tech-stack">
                    {exp.technologies.map((tech, i) => (
                      <span key={i} className="tech-tag">
                        <img 
                          src={getTechIcon(tech)}
                          alt={tech}
                          className="tech-icon"
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                        {tech}
                      </span>
                    ))}
                  </div>
                )}

                {exp.achievements && exp.achievements.length > 0 && (
                  <>
                    <button 
                      className="expand-btn"
                      onClick={() => toggleExperience(exp._id)}
                      aria-expanded={!!expandedExperience[exp._id]}
                      aria-label={expandedExperience[exp._id] ? "Collapse" : "Expand"}
                    ></button>

                    {expandedExperience[exp._id] && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        transition={{ duration: 0.3 }}
                      >
                        <h4 style={{ marginTop: '1rem', marginBottom: '0.5rem', textAlign: 'left' }}>
                          Key Achievements:
                        </h4>
                        <ul className="experience-achievements">
                          {exp.achievements.map((achievement, i) => (
                            <li key={i}>{achievement}</li>
                          ))}
                        </ul>
                      </motion.div>
                    )}
                  </>
                )}
              </motion.div>
            ))
          )}
        </motion.div>
      </section>

      {/* PROJECTS SECTION */}
      <section id="projects" className="section">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="section-title">Featured Projects</h2>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="experience-grid"
        >
          {projects.length === 0 ? (
            <p style={{ textAlign: 'center', color: 'var(--text-light)', gridColumn: '1 / -1' }}>
              No featured projects yet.
            </p>
          ) : (
            projects.map((project) => (
              <motion.div
                key={project._id}
                className="experience-card project-card"
                variants={itemVariants}
              >
                {project.imageUrl && (
                  <div className="project-image">
                    <img 
                      src={project.imageUrl}
                      alt={project.name}
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  </div>
                )}

                <h3>{project.name}</h3>
                <p className="experience-meta">
                  {project.startDate} - {project.endDate}
                </p>

                <p className="experience-description">{project.description}</p>

                <div className="tech-stack">
                  {project.technologies.map((tech, i) => (
                    <span key={i} className="tech-tag">
                      <img 
                        src={getTechIcon(tech)}
                        alt={tech}
                        className="tech-icon"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                      {tech}
                    </span>
                  ))}
                </div>

                {project.highlights && project.highlights.length > 0 && (
                  <>
                    <button 
                      className="expand-btn"
                      onClick={() => toggleProject(project._id)}
                      aria-expanded={!!expandedProject[project._id]}
                      aria-label={expandedProject[project._id] ? "Collapse" : "Expand"}
                    ></button>

                    {expandedProject[project._id] && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        transition={{ duration: 0.3 }}
                      >
                        <h4 style={{ marginTop: '1rem', marginBottom: '0.5rem', textAlign: 'left' }}>
                          Highlights:
                        </h4>
                        <ul className="experience-achievements">
                          {project.highlights.map((highlight, i) => (
                            <li key={i}>{highlight}</li>
                          ))}
                        </ul>
                      </motion.div>
                    )}
                  </>
                )}

                <div className="project-links">
                  {project.githubUrl && (
                    <a href={project.githubUrl} target="_blank" rel="noopener noreferrer">
                      GitHub
                    </a>
                  )}
                  {project.liveUrl && (
                    <a href={project.liveUrl} target="_blank" rel="noopener noreferrer">
                      Live Demo
                    </a>
                  )}
                </div>
              </motion.div>
            ))
          )}
        </motion.div>
      </section>

      {/* EDUCATION SECTION */}
      {education.length > 0 && (
        <section id="education" className="section">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="section-title">Education</h2>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="education-horizontal-list"
          >
            {education.map((edu) => (
              <motion.div
                key={edu._id}
                className="experience-card education-card"
                variants={itemVariants}
              >
                <div className="education-left">
                  {edu.logoUrl && (
                    <div className="company-logo">
                      <img 
                        src={edu.logoUrl}
                        alt={edu.company}
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                </div>

                <div className="education-content">
                  <h3>{edu.company}</h3>
                  <p className="experience-role">{edu.title}</p>
                  <p className="experience-meta">
                    {edu.location} • {edu.startDate} - {edu.endDate}
                  </p>

                  {edu.description && (
                    <p className="experience-description">{edu.description}</p>
                  )}

                  {edu.achievements && edu.achievements.length > 0 && expandedEducation[edu._id] && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      transition={{ duration: 0.3 }}
                    >
                      <h4 style={{ marginTop: '1rem', marginBottom: '0.5rem', textAlign: 'left' }}>
                        Achievements:
                      </h4>
                      <ul className="experience-achievements">
                        {edu.achievements.map((achievement, i) => (
                          <li key={i}>{achievement}</li>
                        ))}
                      </ul>
                    </motion.div>
                  )}
                </div>

                {edu.achievements && edu.achievements.length > 0 && (
                  <button 
                    className="expand-btn"
                    onClick={() => toggleEducation(edu._id)}
                    aria-expanded={!!expandedEducation[edu._id]}
                    aria-label={expandedEducation[edu._id] ? "Collapse" : "Expand"}
                    ></button>
                )}
              </motion.div>
            ))}
          </motion.div>
        </section>
      )}

      {/* RELATED COURSES SECTION */}
      {courses.length > 0 && (
        <section id="courses" className="section">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <div className="courses-card">
              <div className="courses-header" onClick={() => setExpandedCourses(!expandedCourses)}>
                <h3>Related Courses</h3>
                <button
                  className="expand-btn"
                  style={{ position: 'relative' }}
                  aria-expanded={expandedCourses}
                  aria-label={expandedCourses ? "Collapse" : "Expand"}
                ></button>
              </div>

              {expandedCourses && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  transition={{ duration: 0.3 }}
                >
                  <ul className="courses-list">
                    {courses.map((course, i) => (
                      <li key={i}>
                        <div className="course-name">{course.name}</div>
                        {course.description && (
                          <div className="course-description">{course.description}</div>
                        )}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              )}
            </div>
          </motion.div>
        </section>
      )}

      {/* VOLUNTEER SECTION */}
      {volunteer.length > 0 && (
        <section id="volunteer" className="section">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="section-title">Volunteer Experience</h2>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="experience-grid"
          >
            {volunteer.map((vol) => (
              <motion.div
                key={vol._id}
                className="experience-card"
                variants={itemVariants}
              >
                {vol.logoUrl && (
                  <div className="company-logo">
                    <img 
                      src={vol.logoUrl}
                      alt={vol.company}
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  </div>
                )}

                <h3>{vol.company}</h3>
                <p className="experience-role">{vol.title}</p>
                <p className="experience-meta">
                  {vol.location} • {vol.startDate} - {vol.endDate}
                </p>

                {vol.description && (
                  <p className="experience-description">{vol.description}</p>
                )}

                {vol.technologies && vol.technologies.length > 0 && (
                  <div className="tech-stack">
                    {vol.technologies.map((tech, i) => (
                      <span key={i} className="tech-tag">
                        <img 
                          src={getTechIcon(tech)}
                          alt={tech}
                          className="tech-icon"
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                        {tech}
                      </span>
                    ))}
                  </div>
                )}

                {vol.achievements && vol.achievements.length > 0 && (
                  <>
                    <button 
                      className="expand-btn"
                      onClick={() => toggleVolunteer(vol._id)}
                      aria-expanded={!!expandedVolunteer[vol._id]}
                      aria-label={expandedVolunteer[vol._id] ? "Collapse" : "Expand"}
                    ></button>

                    {expandedVolunteer[vol._id] && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        transition={{ duration: 0.3 }}
                      >
                        <h4 style={{ marginTop: '1rem', marginBottom: '0.5rem', textAlign: 'left' }}>
                          Key Contributions:
                        </h4>
                        <ul className="experience-achievements">
                          {vol.achievements.map((achievement, i) => (
                            <li key={i}>{achievement}</li>
                          ))}
                        </ul>
                      </motion.div>
                    )}
                  </>
                )}
              </motion.div>
            ))}
          </motion.div>
        </section>
      )}

      {/* TECHNICAL SKILLS SECTION - FROM DATABASE */}
      {skills.length > 0 && (
        <section id="skills" className="section">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="section-title">Technical Skills</h2>
          </motion.div>

          <motion.div
            className="skills-grid"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {skills.map((skillCategory) => (
              <motion.div key={skillCategory._id} className="skill-category" variants={itemVariants}>
                <h3>{skillCategory.category}</h3>
                <div className="skill-tags">
                  {skillCategory.skills
                    .filter(skill => skill.featured)
                    .map((skill, i) => (
                      <span key={i} className="tech-tag">
                        <img 
                          src={getTechIcon(skill.name)}
                          alt={skill.name}
                          className="tech-icon"
                          onError={(e) => e.target.style.display = 'none'}
                        />
                        {skill.name}
                      </span>
                    ))}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </section>
      )}
    </motion.div>
  );
}

export default Home;