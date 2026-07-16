const fs = require('fs');
const path = require('path');

const srcFile = path.join(__dirname, '..', 'sonamu_design', 'index.html');
const html = fs.readFileSync(srcFile, 'utf8');

function extractSection(id) {
    const regex = new RegExp(`<section id="${id}"[\\s\\S]*?>([\\s\\S]*?)<\\/section>`);
    const match = html.match(regex);
    if (!match) return null;
    let content = match[0];
    
    // HTML to JSX conversions
    content = content.replace(/class=/g, 'className=');
    content = content.replace(/for=/g, 'htmlFor=');
    content = content.replace(/onclick=".*?"/g, ''); 
    content = content.replace(/onchange=".*?"/g, '');
    content = content.replace(/onerror=".*?"/g, '');
    
    // Close tags
    content = content.replace(/<img(.*?)>/g, (m, p) => p.endsWith('/') ? m : `<img${p} />`);
    content = content.replace(/<input(.*?)>/g, (m, p) => p.endsWith('/') ? m : `<input${p} />`);
    content = content.replace(/<br>/g, '<br />');
    content = content.replace(/<hr(.*?)>/g, (m, p) => p.endsWith('/') ? m : `<hr${p} />`);
    
    // Some inline styles to React objects (basic)
    content = content.replace(/style="([^"]*)"/g, (m, val) => {
       return 'style={{}}';
    });

    // Replace checked attribute
    content = content.replace(/checked=""/g, 'defaultChecked');

    return content;
}

const sections = ['home', 'services', 'portfolio', 'equipment', 'contact'];
const tools = ['calculator', 'harikomi', 'qrcode', 'yieldcalc'];

sections.forEach(s => {
    let jsx = extractSection(s);
    if (!jsx) return;
    const pascal = s.charAt(0).toUpperCase() + s.slice(1);
    let code = `import React from 'react';\n\nconst ${pascal} = (props: any) => {\n  return (\n    ${jsx}\n  );\n};\nexport default ${pascal};\n`;
    fs.writeFileSync(path.join(__dirname, 'src', 'components', 'sections', `${pascal}.tsx`), code);
});

const toolMap = {
  'calculator': 'SenecaCalc',
  'harikomi': 'Harikomi',
  'qrcode': 'QrGenerator',
  'yieldcalc': 'YieldCalc'
};
tools.forEach(s => {
    let jsx = extractSection(s);
    if (!jsx) return;
    const pascal = toolMap[s];
    let code = `import React from 'react';\n\nconst ${pascal} = (props: any) => {\n  return (\n    ${jsx}\n  );\n};\nexport default ${pascal};\n`;
    fs.writeFileSync(path.join(__dirname, 'src', 'components', 'tools', `${pascal}.tsx`), code);
});
console.log('Conversion done.');
