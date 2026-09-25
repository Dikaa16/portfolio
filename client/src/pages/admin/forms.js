import React from 'react';
import { Field, ListField, SelectField, CheckboxField, ImageField, DateRange } from './fields';

const TAGS_LABEL = 'Tags (pipe-separated, e.g. item1 | item2)';
const PHOTO_CATEGORIES = ['landscape', 'portrait', 'street', 'event', 'other'];
export const EXPERIENCE_TYPES = ['work', 'education', 'volunteer'];

export function ExperienceForm({ form }) {
  return (
    <>
      <Field label="Title (Job Title) *" name="title" form={form} required placeholder="Software Engineer" />
      <Field label="Organization *" name="company" form={form} required placeholder="Tech Organization Inc" />
      <ImageField label="Company Logo" name="logoUrl" folder="experience" form={form} />
      <Field label="Location" name="location" form={form} placeholder="Vancouver, BC" />
      <DateRange form={form} required />
      <Field label="Description" name="description" form={form} textarea rows="3" placeholder="Brief description" />
      <ListField label="Technologies" name="technologies" form={form} placeholder="React | Node.js | MongoDB" />
      <ListField label="Achievements" name="achievements" form={form} textarea rows="3" placeholder="Led team of 5 | Improved performance by 50%" />
      <SelectField label="Type *" name="type" form={form} options={EXPERIENCE_TYPES} />
      <CheckboxField label="Featured (show on homepage)" name="featured" form={form} />
    </>
  );
}

export function ProjectForm({ form }) {
  return (
    <>
      <Field label="Project Name *" name="name" form={form} required placeholder="My Awesome Project" />
      <ImageField label="Project Image" name="imageUrl" folder="projects" form={form} />
      <Field label="Description *" name="description" form={form} textarea required rows="3" />
      <ListField label="Technologies" name="technologies" form={form} required placeholder="React | Node.js" />
      <Field label="GitHub URL" name="githubUrl" form={form} placeholder="https://github.com/username/project" />
      <Field label="Live Demo URL" name="liveUrl" form={form} placeholder="https://project.com" />
      <ListField label="Highlights" name="highlights" form={form} textarea rows="3" />
      <DateRange form={form} />
      <CheckboxField label="Featured (show on homepage)" name="featured" form={form} />
    </>
  );
}

export function SkillForm({ form }) {
  return (
    <>
      <Field label="Category Name *" name="category" form={form} required placeholder="e.g., Languages, Frameworks, Tools" />
      <ListField label="Skills *" name="skills" form={form} textarea required rows="3" placeholder="JavaScript | Python | Java | TypeScript" />
      <CheckboxField label="Featured (show on homepage)" name="featured" form={form} />
    </>
  );
}

export function CourseForm({ form }) {
  return (
    <>
      <Field label="Course Name *" name="name" form={form} required placeholder="Data Structures and Algorithms" />
      <Field label="Description" name="description" form={form} textarea rows="3" placeholder="Brief description" />
      <CheckboxField label="Featured (show on homepage)" name="featured" form={form} />
    </>
  );
}

export function BlogForm({ form }) {
  return (
    <>
      <Field label="Title *" name="title" form={form} required />
      <Field label="Slug *" name="slug" form={form} required placeholder="my-blog-post" hint="URL-friendly (lowercase, hyphens)" />
      <Field label="Excerpt *" name="excerpt" form={form} textarea required rows="2" maxLength="200" hint="Max 200 characters" />
      <Field label="Content *" name="content" form={form} textarea required rows="15" hint="Supports Markdown" />
      <ImageField label="Cover Image" name="coverImage" folder="blog" form={form} />
      <ListField label={TAGS_LABEL} name="tags" form={form} placeholder="tech | coding | tutorial" />
      <CheckboxField label="Published" name="published" form={form} />
    </>
  );
}

export function PhotoForm({ form }) {
  return (
    <>
      <Field label="Title *" name="title" form={form} required placeholder="Sunset at English Bay" />
      <ImageField label="Image *" name="imageUrl" folder="photography" form={form} />
      <Field label="Description" name="description" form={form} textarea rows="3" placeholder="Brief description" />
      <SelectField label="Category" name="category" form={form} options={PHOTO_CATEGORIES} />
      <ListField label={TAGS_LABEL} name="tags" form={form} placeholder="nature | sunset | vancouver" />
      <CheckboxField label="Featured (show on Creatives page)" name="featured" form={form} />
    </>
  );
}

export function VideoForm({ form }) {
  return (
    <>
      <Field label="Title *" name="title" form={form} required placeholder="My Video" />
      <Field label="YouTube Video ID *" name="youtubeId" form={form} required placeholder="dQw4w9WgXcQ" hint="The ID from youtube.com/watch?v=THIS_PART" />
      <ImageField label="Custom Thumbnail (optional)" name="thumbnail" folder="videos" form={form} />
      <Field label="Description" name="description" form={form} textarea rows="3" />
      <Field label="Category" name="category" form={form} placeholder="e.g. vlog, tutorial, music" />
      <ListField label={TAGS_LABEL} name="tags" form={form} placeholder="vlog | travel" />
      <CheckboxField label="Featured (show on Creatives page)" name="featured" form={form} />
    </>
  );
}

export function OtherForm({ form }) {
  return (
    <>
      <Field label="Title *" name="title" form={form} required placeholder="My Creative Work" />
      <Field label="Description" name="description" form={form} textarea rows="3" />
      <ImageField label="Image" name="imageUrl" folder="creatives" form={form} />
      <Field label="Link URL" name="linkUrl" form={form} placeholder="https://..." />
      <Field label="Category" name="category" form={form} placeholder="e.g. design, music, writing" />
      <ListField label={TAGS_LABEL} name="tags" form={form} placeholder="design | illustration" />
      <CheckboxField label="Featured (show on Creatives page)" name="featured" form={form} />
    </>
  );
}
