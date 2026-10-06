// Document readiness: compares documents the opportunity needs with documents the student ticked.
const norm = s => String(s).toLowerCase().trim();
exports.readiness = (d, u) => {
  const required = d.documentsRequired || [];
  const have = new Set((u.myDocuments || []).map(norm));
  return {
    total: required.length,
    ready: required.filter(x => have.has(norm(x))),
    missing: required.filter(x => !have.has(norm(x))),
  };
};