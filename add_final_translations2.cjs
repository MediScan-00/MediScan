const fs = require('fs');
let content = fs.readFileSync('src/lib/i18n.ts', 'utf8');

const missingEn = {
  advice: "Advice"
};

const missingAr = {
  advice: "نصيحة"
};

const insertMissing = (langBlockStr, missingData) => {
  let newEntries = Object.entries(missingData).map(([k,v]) => {
     if(!langBlockStr.includes(k + ':')) {
        return '  ' + k + ': "' + v.replace(/"/g, '\\"') + '",';
     }
     return null;
  }).filter(Boolean).join('\n');
  
  if (newEntries.length > 0) {
     return langBlockStr.replace(/\{/, '{\n' + newEntries + '\n');
  }
  return langBlockStr;
};

if (content.includes('en: {') && content.includes('ar: {')) {
   let enBlock = content.substring(content.indexOf('en: {'), content.indexOf('ar: {'));
   let arBlockStart = content.indexOf('ar: {');
   let frBlockStart = content.indexOf('fr: {');
   let arBlock = content.substring(arBlockStart, frBlockStart > arBlockStart ? frBlockStart : content.indexOf('};'));

   let updatedEn = insertMissing(enBlock, missingEn);
   let updatedAr = insertMissing(arBlock, missingAr);

   content = content.replace(enBlock, updatedEn).replace(arBlock, updatedAr);
}

fs.writeFileSync('src/lib/i18n.ts', content);
