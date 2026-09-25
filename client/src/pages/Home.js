import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { api, loadErrorMessage } from '../lib/api';
import { pageTransition, staggerContainer, fadeUpItem, expandReveal } from '../lib/animations';
import ExpandButton from '../components/ExpandButton';
import TechTag, { TechStack } from '../components/TechTag';

const HERO_PHOTO = 'https://res.cloudinary.com/dearql1iq/image/upload/v1770292355/Andika-speech_sy5ubk.png';
const HERO_FALLBACK = 'https://ui-avatars.com/api/?name=Andika+Sentosa+Putra&size=400&background=d4af37&color=fff&bold=true';

const containerVariants = staggerContainer();
const itemVariants = fadeUpItem();

const hideOnError = (e) => { e.target.style.display = 'none'; };

function SectionTitle({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      viewport={{ once: true }}
    >
      <h2 className="section-title">{children}</h2>
    </motion.div>
  );
}

function StaggerGrid({ className, children }) {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function Logo({ src, alt }) {
  if (!src) return null;
  return (
    <div className="company-logo">
      <img src={src} alt={alt} onError={hideOnError} />
    </div>
  );
}

// Bulleted list revealed by an expand button
function DetailsList({ title, items }) {
  return (
    <motion.div {...expandReveal}>
      <h4 className="details-title">{title}</h4>
      <ul className="experience-achievements">
        {items.map((item, i) => <li key={i}>{item}</li>)}
      </ul>
    </motion.div>
  );
}

function ExperienceCard({ item, detailsTitle, expanded, onToggle }) {
  const hasDetails = item.achievements?.length > 0;
  return (
    <motion.div className="experience-card" variants={itemVariants}>
      <Logo src={item.logoUrl} alt={item.company} />
      <h3>{item.company}</h3>
      <p className="experience-role">{item.title}</p>
      <p className="experience-meta">{item.location} • {item.startDate} - {item.endDate}</p>
      {item.description && <p className="experience-description">{item.description}</p>}
      <TechStack items={item.technologies} />

      {hasDetails && <ExpandButton expanded={expanded} onClick={onToggle} />}
      {hasDetails && expanded && <DetailsList title={detailsTitle} items={item.achievements} />}
    </motion.div>
  );
}

function ProjectCard({ project, expanded, onToggle }) {
  const hasDetails = project.highlights?.length > 0;
  return (
    <motion.div className="experience-card project-card" variants={itemVariants}>
      {project.imageUrl && (
        <div className="project-image">
          <img src={project.imageUrl} alt={project.name} onError={hideOnError} />
        </div>
      )}
      <h3>{project.name}</h3>
      <p className="experience-meta">{project.startDate} - {project.endDate}</p>
      <p className="experience-description">{project.description}</p>
      <TechStack items={project.technologies} />

      {hasDetails && <ExpandButton expanded={expanded} onClick={onToggle} />}
      {hasDetails && expanded && <DetailsList title="Highlights:" items={project.highlights} />}

      <div className="project-links">
        {project.githubUrl && <a href={project.githubUrl} target="_blank" rel="noopener noreferrer">GitHub</a>}
        {project.liveUrl && <a href={project.liveUrl} target="_blank" rel="noopener noreferrer">Live Demo</a>}
      </div>
    </motion.div>
  );
}

function EducationCard({ item, expanded, onToggle }) {
  const hasDetails = item.achievements?.length > 0;
  return (
    <motion.div className="experience-card education-card" variants={itemVariants}>
      <div className="education-left">
        <Logo src={item.logoUrl} alt={item.company} />
      </div>
      <div className="education-content">
        <h3>{item.company}</h3>
        <p className="experience-role">{item.title}</p>
        <p className="experience-meta">{item.location} • {item.startDate} - {item.endDate}</p>
        {item.description && <p className="experience-description">{item.description}</p>}
        {hasDetails && expanded && <DetailsList title="Achievements:" items={item.achievements} />}
      </div>
      {hasDetails && <ExpandButton expanded={expanded} onClick={onToggle} />}
    </motion.div>
  );
}

function CoursesCard({ courses, expanded, onToggle }) {
  return (
    <div className="courses-card">
      <div className="courses-header" onClick={onToggle}>
        <h3>Related Courses</h3>
        <ExpandButton expanded={expanded} style={{ position: 'relative' }} />
      </div>
      {expanded && (
        <motion.div {...expandReveal}>
          <ul className="courses-list">
            {courses.map(course => (
              <li key={course._id}>
                <div className="course-name">{course.name}</div>
                {course.description && <div className="course-description">{course.description}</div>}
              </li>
            ))}
          </ul>
        </motion.div>
      )}
    </div>
  );
}

function Home() {
  const [content, setContent] = useState(null);
  const [error, setError] = useState(null);
  const [expanded, setExpanded] = useState({});

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const [exp, projects, skills, courses] = await Promise.all(
          ['experience', 'projects', 'skills', 'courses'].map(endpoint => api.get(`/${endpoint}`))
        );
        const featured = (items) => items.filter(item => item.featured);
        const experienceOfType = (type) => featured(exp.data).filter(item => item.type === type);

        setContent({
          work: experienceOfType('work'),
          education: experienceOfType('education'),
          volunteer: experienceOfType('volunteer'),
          projects: featured(projects.data),
          skills: featured(skills.data),
          courses: featured(courses.data)
        });
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(loadErrorMessage(err, 'Failed to load content. Please try again later.'));
      }
    };
    fetchAllData();
  }, []);

  const toggle = (id) => setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
  const cardProps = (id) => ({ expanded: Boolean(expanded[id]), onToggle: () => toggle(id) });

  if (error) {
    return (
      <div className="page">
        <div className="empty-state"><h3>⚠️ {error}</h3></div>
      </div>
    );
  }

  if (!content) {
    return (
      <div className="page"><div className="loading">Loading...</div></div>
    );
  }

  const { work, education, volunteer, projects, skills, courses } = content;

  return (
    <motion.div {...pageTransition}>
      <section className="hero">
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="hero-content">
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
              <img src={HERO_PHOTO} alt="Andika Sentosa Putra" onError={(e) => { e.target.src = HERO_FALLBACK; }} />
            </div>
          </motion.div>
        </motion.div>
      </section>

      <section id="work-experience" className="section">
        <SectionTitle>Work Experience</SectionTitle>
        <StaggerGrid className="experience-grid">
          {work.length === 0 ? (
            <p className="grid-empty">No featured work experience yet.</p>
          ) : (
            work.map(item => (
              <ExperienceCard key={item._id} item={item} detailsTitle="Key Achievements:" {...cardProps(item._id)} />
            ))
          )}
        </StaggerGrid>
      </section>

      <section id="projects" className="section">
        <SectionTitle>Featured Projects</SectionTitle>
        <StaggerGrid className="experience-grid">
          {projects.length === 0 ? (
            <p className="grid-empty">No featured projects yet.</p>
          ) : (
            projects.map(project => (
              <ProjectCard key={project._id} project={project} {...cardProps(project._id)} />
            ))
          )}
        </StaggerGrid>
      </section>

      {education.length > 0 && (
        <section id="education" className="section">
          <SectionTitle>Education</SectionTitle>
          <StaggerGrid className="education-horizontal-list">
            {education.map(item => (
              <EducationCard key={item._id} item={item} {...cardProps(item._id)} />
            ))}
          </StaggerGrid>
        </section>
      )}

      {courses.length > 0 && (
        <section id="courses" className="section">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <CoursesCard courses={courses} {...cardProps('courses')} />
          </motion.div>
        </section>
      )}

      {volunteer.length > 0 && (
        <section id="volunteer" className="section">
          <SectionTitle>Volunteer Experience</SectionTitle>
          <StaggerGrid className="experience-grid">
            {volunteer.map(item => (
              <ExperienceCard key={item._id} item={item} detailsTitle="Key Contributions:" {...cardProps(item._id)} />
            ))}
          </StaggerGrid>
        </section>
      )}

      {skills.length > 0 && (
        <section id="skills" className="section">
          <SectionTitle>Technical Skills</SectionTitle>
          <StaggerGrid className="skills-grid">
            {skills.map(group => (
              <motion.div key={group._id} className="skill-category" variants={itemVariants}>
                <h3>{group.category}</h3>
                <div className="skill-tags">
                  {group.skills
                    .filter(skill => skill.featured)
                    .map((skill, i) => <TechTag key={`${skill.name}-${i}`} name={skill.name} />)}
                </div>
              </motion.div>
            ))}
          </StaggerGrid>
        </section>
      )}
    </motion.div>
  );
}

export default Home;
