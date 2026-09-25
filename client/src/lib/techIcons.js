// Icons in public/assets/icons. The server is case-sensitive, so names must match
// the files exactly; add the file name here when adding a new icon.
const ICON_FILES = [
  'Bootstrap', 'C++', 'C', 'CSS', 'Express', 'Gdb', 'Git', 'GitHub', 'HTML', 'JSON', 'JUnit',
  'Jama', 'Java', 'JavaScript', 'Jira', 'MicrosoftSQLServer', 'Mocha', 'MongoDB', 'Node',
  'Oracle', 'PHP', 'Postman', 'Python', 'React', 'Render', 'SQL', 'SQLDeveloper', 'TypeScript',
  'Unity', 'chai', 'csharp', 'ejs', 'jQuery', 'swing', 'vmware'
];

// Other ways a technology is commonly written → icon file
const ALIASES = {
  'c#': 'csharp',
  nodejs: 'Node',
  expressjs: 'Express',
  reactjs: 'React',
  js: 'JavaScript',
  ts: 'TypeScript',
  html5: 'HTML',
  css3: 'CSS',
  mongo: 'MongoDB',
  sqlserver: 'MicrosoftSQLServer',
  mssql: 'MicrosoftSQLServer',
  microsoftsqlserver: 'MicrosoftSQLServer',
  javaswing: 'swing'
};

// "Node.js", "node js" and "NodeJS" all normalise to "nodejs"
const normalize = (name) => name.toLowerCase().replace(/[\s.\-_]/g, '');

const ICONS = Object.fromEntries(ICON_FILES.map(file => [normalize(file), file]));

// Simple Icons (https://simpleicons.org) slug rules: "Chart.js" -> "chartdotjs",
// "C++" -> "cplusplus", "Tailwind CSS" -> "tailwindcss"
const simpleIconsSlug = (name) => name
  .toLowerCase()
  .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  .replace(/\+/g, 'plus')
  .replace(/\./g, 'dot')
  .replace(/&/g, 'and')
  .replace(/#/g, 'sharp')
  .replace(/[^a-z0-9]/g, '');

// Icon URL for a technology: our own file when we have one, otherwise the
// brand logo from the Simple Icons CDN (TechTag hides it if that 404s)
export const techIconUrl = (tech) => {
  const key = normalize(tech);
  const file = ICONS[key] || ALIASES[key];
  if (file) return `/assets/icons/${encodeURIComponent(file)}.svg`;
  const slug = simpleIconsSlug(tech);
  return slug ? `https://cdn.simpleicons.org/${slug}` : null;
};
