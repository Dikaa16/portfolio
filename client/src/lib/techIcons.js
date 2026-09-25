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

// URL of the icon for a technology, or null when there is none
export const techIconUrl = (tech) => {
  const key = normalize(tech);
  const file = ICONS[key] || ALIASES[key];
  return file ? `/assets/icons/${encodeURIComponent(file)}.svg` : null;
};
