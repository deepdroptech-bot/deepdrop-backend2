const company =
require("../config/company");

const companyHeader =
(title="REPORT")=>{

return `

<div class="company-header">

<img
src="${company.logo}"
height="60"
/>

<h1>

${company.name}

</h1>

<p>

Branch:
${company.branch}

</p>

<p>

${company.address}

</p>

<p>

Tel:
${company.phone}

</p>

<h2>

${title}

</h2>

<hr/>

</div>

`;

};

module.exports =
companyHeader;