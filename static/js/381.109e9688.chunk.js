"use strict";(self.webpackChunkqaproject=self.webpackChunkqaproject||[]).push([[381],{7649:(e,n,s)=>{s.r(n),s.d(n,{default:()=>x});var a=s(5043),l=s(5475),t=s(3910),c=s(7929),i=s(3141),o=s(6213),r=s(9582),d=(s(2360),s(64)),m=s.n(d),h=s(579);function x(){const[e,n]=(0,a.useState)([]),[s,d]=(0,a.useState)(null),[x,b]=(0,a.useState)(!1),[g,p]=(0,a.useState)([]),[v,j]=(0,a.useState)(1),[u,N]=(0,a.useState)(null);(0,a.useEffect)((()=>{o.A.get("https://jsonplaceholder.typicode.com/todos/").then((e=>{const s=e.data.map(((e,n)=>({id:n+1,eventId:e.userId,eventType:e.title,eventSubtype:"Car Accident",callTime:"2:10 min",reviewStatus:e.completed?"Completed":"Pending",src:"https://www.soundhelix.com/examples/mp3/SoundHelix-Song-".concat(n%16+1,".mp3")})));n(s)})).catch((e=>{console.error("Error fetching data:",e)}))}),[]),(0,a.useEffect)((()=>{const n=10*v,s=n-10;p(e.slice(s,n))}),[v,e]);(0,i.useReactToPrint)({content:()=>document.getElementById("table-to-print")});const f=(e,n)=>{C((s=>({...s,[e]:n})))},[w,C]=(0,a.useState)({complianceSOP:null,activeListening:null,correctDetails:null,addressTagging:null,callHandlingTime:null,remark:""});return(0,h.jsx)(h.Fragment,{children:(0,h.jsx)("div",{className:"main_content_iner overly_inner mt-5",children:(0,h.jsxs)("div",{className:"container-fluid p-0",children:[(0,h.jsx)("div",{className:"row",children:(0,h.jsx)("div",{className:"col-12",children:(0,h.jsx)("div",{className:"page_title_box d-flex align-items-center justify-content-between",children:(0,h.jsxs)("div",{className:"page_title_left",children:[(0,h.jsx)("h3",{className:"f_s_30 f_w_700 text_white",children:"Actionable Calls"}),(0,h.jsxs)("ol",{className:"breadcrumb page_bradcam mb-0",children:[(0,h.jsx)("li",{className:"breadcrumb-item",children:(0,h.jsx)(l.N_,{to:"/dashboard",children:"Dashboard"})}),(0,h.jsx)("li",{className:"breadcrumb-item",children:(0,h.jsx)(l.N_,{to:"/dashboard",children:"Call logs"})}),(0,h.jsx)("li",{className:"breadcrumb-item active",children:(0,h.jsx)(l.N_,{to:"#",children:"Actionable Calls"})})]})]})})})}),(0,h.jsx)("div",{className:"container-fluid",children:(0,h.jsxs)("div",{className:"row justify-content-center",children:[(0,h.jsx)("div",{className:"col-lg-6",children:(0,h.jsxs)("div",{className:"white_card mb-20",children:[(0,h.jsxs)("table",{className:"table table-responsive table-striped table-bordered call-logs-table ml-4",children:[(0,h.jsx)("thead",{children:(0,h.jsxs)("tr",{children:[(0,h.jsx)("th",{scope:"col",children:"Sr. No"}),(0,h.jsx)("th",{scope:"col",children:"Event Type"}),(0,h.jsx)("th",{scope:"col",children:"Event Subtype"}),(0,h.jsx)("th",{scope:"col",children:"Review Status"}),(0,h.jsx)("th",{scope:"col",children:"Action "})]})}),(0,h.jsx)("tbody",{children:g.map((e=>(0,h.jsxs)("tr",{children:[(0,h.jsx)("td",{children:e.id}),(0,h.jsx)("td",{children:e.eventType}),(0,h.jsx)("td",{children:e.eventSubtype}),(0,h.jsx)("td",{children:(0,h.jsx)("span",{className:"Pending"===e.reviewStatus?"text-danger font-weight-bold":"Completed"===e.reviewStatus?"text-success font-weight-bold":"",children:e.reviewStatus})}),(0,h.jsx)("td",{children:(0,h.jsxs)("div",{className:"d-flex align-items-center",children:[(0,h.jsx)("button",{className:"btn btn-outline-info me-2","data-bs-toggle":"tooltip","data-bs-placement":"top",title:"Click here for more info",onClick:()=>{return n=e,void m().fire({title:"Call Information",html:'\n        <div class="swal-custom-container">\n          <div class="swal-info">\n            <div class="info-row">\n              <strong>Additional Signal Info:</strong>\n              <span>'.concat(n.additionalSignalInfo||"N/A",'</span>\n            </div>\n            <div class="info-row">\n              <strong>Call Pick Duration:</strong>\n              <span>').concat(n.callPickDuration||"N/A",'</span>\n            </div>\n            <div class="info-row">\n              <strong>Call Duration:</strong>\n              <span>').concat(n.callDuration||"N/A",'</span>\n            </div>\n            <div class="info-row">\n              <strong>Event Registration Time:</strong>\n              <span>').concat(n.eventRegistrationTime||"N/A",'</span>\n            </div>\n            <div class="info-row">\n              <strong>Priority:</strong>\n              <span>').concat(n.priority||"N/A",'</span>\n            </div>\n            <div class="info-row">\n              <strong>District:</strong>\n              <span>').concat(n.district||"N/A",'</span>\n            </div>\n            <div class="info-row">\n              <strong>Victim Name:</strong>\n              <span>').concat(n.victimName||"N/A",'</span>\n            </div>\n            <div class="info-row">\n              <strong>Victim Age:</strong>\n              <span>').concat(n.victimAge||"N/A",'</span>\n            </div>\n            <div class="info-row">\n              <strong>Victim Gender:</strong>\n              <span>').concat(n.victimGender||"N/A",'</span>\n            </div>\n            <div class="info-row">\n              <strong>Victim Address:</strong>\n              <span>').concat(n.victimAddress||"N/A",'</span>\n            </div>\n            <div class="info-row">\n              <strong>Additional Information:</strong>\n              <span>').concat(n.additionalInformation||"N/A",'</span>\n            </div>\n            <div class="info-row">\n              <strong>Near PS:</strong>\n              <span>').concat(n.nearPS||"N/A","</span>\n            </div>\n          </div>\n        </div>\n      "),confirmButtonText:"Close",customClass:{container:"swal-custom-container",title:"swal-title",content:"swal-content",confirmButton:"swal-confirm-button"}});var n},children:(0,h.jsx)(t.FontAwesomeIcon,{icon:c.faInfoCircle,className:"fa-info-circle"})}),(0,h.jsx)("button",{className:"btn btn-outline-primary me-2","data-bs-toggle":"tooltip","data-bs-placement":"top",title:"Click here play",onClick:()=>{return n=e.src,a=e.id,s===n?b(!x):(d(n),b(!0)),void N(a);var n,a},children:(0,h.jsx)(t.FontAwesomeIcon,{icon:x&&s===e.src?c.faPause:c.faPlay})})]})})]},e.id)))})]}),(0,h.jsx)("ul",{id:"page-numbers",className:"pagination justify-content-end",children:(()=>{const n=Math.ceil(e.length/10),s=[],a=Math.max(1,v-2),l=Math.min(n,v+2);v>1?s.push((0,h.jsx)("li",{onClick:()=>j(v-1),children:"\xab"},"prev")):s.push((0,h.jsx)("li",{className:"disabled",children:"\xab"},"prev"));for(let e=a;e<=l;e++)s.push((0,h.jsx)("li",{className:e===v?"active":"",onClick:()=>j(e),children:e},e));return v<n?s.push((0,h.jsx)("li",{onClick:()=>j(v+1),children:"\xbb"},"next")):s.push((0,h.jsx)("li",{className:"disabled",children:"\xbb"},"next")),s})()})]})}),(0,h.jsx)("div",{className:"col-lg-6 ",children:(0,h.jsxs)("div",{className:"white_card mb-20",children:[(0,h.jsx)("div",{className:"audio-player-section p-20",children:(0,h.jsx)(r.A,{src:s,autoPlay:x,onPlay:()=>b(!0),onPause:()=>b(!1)})}),(0,h.jsx)("hr",{}),(0,h.jsx)("div",{className:"wrapper ml-3 white_card mb-20",children:(0,h.jsxs)("div",{className:"card-body",children:[(0,h.jsx)("h3",{children:"Questionnaire"}),(0,h.jsxs)("div",{className:"container",children:[(0,h.jsxs)("div",{className:"row mb-3",children:[(0,h.jsx)("div",{className:"col-6",children:(0,h.jsx)("label",{className:"form-label",htmlFor:"complianceSOP",children:"1) Compliance of SOP"})}),(0,h.jsx)("div",{className:"col-6",children:(0,h.jsxs)("div",{children:[(0,h.jsx)("button",{className:"btn me-2 ".concat("Poor"===w.complianceSOP?"btn-danger":""),onClick:()=>f("complianceSOP","Poor"),children:"Poor"}),(0,h.jsx)("button",{className:"btn me-2 ".concat("Good"===w.complianceSOP?"btn-warning":""),onClick:()=>f("complianceSOP","Good"),children:"Good"}),(0,h.jsx)("button",{className:"btn me-2 ".concat("Excellent"===w.complianceSOP?"btn-primary":""),onClick:()=>f("complianceSOP","Excellent"),children:"Excellent"})]})})]}),(0,h.jsxs)("div",{className:"row mb-3",children:[(0,h.jsx)("div",{className:"col-6",children:(0,h.jsx)("label",{className:"form-label",htmlFor:"activeListening",children:"2) Active Listening & Proper response"})}),(0,h.jsx)("div",{className:"col-6",children:(0,h.jsxs)("div",{children:[(0,h.jsx)("button",{className:"btn me-2 ".concat("Poor"===w.activeListening?"btn-danger":""),onClick:()=>f("activeListening","Poor"),children:"Poor"}),(0,h.jsx)("button",{className:"btn me-2 ".concat("Good"===w.activeListening?"btn-warning":""),onClick:()=>f("activeListening","Good"),children:"Good"}),(0,h.jsx)("button",{className:"btn me-2 ".concat("Excellent"===w.activeListening?"btn-primary":""),onClick:()=>f("activeListening","Excellent"),children:"Excellent"})]})})]}),(0,h.jsxs)("div",{className:"row mb-3",children:[(0,h.jsx)("div",{className:"col-6",children:(0,h.jsx)("label",{className:"form-label",htmlFor:"correctDetails",children:"3) Correct And Relevant Details Capturing"})}),(0,h.jsx)("div",{className:"col-6",children:(0,h.jsxs)("div",{children:[(0,h.jsx)("button",{className:"btn me-2 ".concat("Poor"===w.correctDetails?"btn-danger":""),onClick:()=>f("correctDetails","Poor"),children:"Poor"}),(0,h.jsx)("button",{className:"btn me-2 ".concat("Good"===w.correctDetails?"btn-warning":""),onClick:()=>f("correctDetails","Good"),children:"Good"}),(0,h.jsx)("button",{className:"btn me-2 ".concat("Excellent"===w.correctDetails?"btn-primary":""),onClick:()=>f("correctDetails","Excellent"),children:"Excellent"})]})})]}),(0,h.jsxs)("div",{className:"row mb-3",children:[(0,h.jsx)("div",{className:"col-6",children:(0,h.jsx)("label",{className:"form-label",htmlFor:"addressTagging",children:"4) Correct Address Tagging"})}),(0,h.jsx)("div",{className:"col-6",children:(0,h.jsxs)("div",{children:[(0,h.jsx)("button",{className:"btn me-2 ".concat("Poor"===w.addressTagging?"btn-danger":""),onClick:()=>f("addressTagging","Poor"),children:"Poor"}),(0,h.jsx)("button",{className:"btn me-2 ".concat("Good"===w.addressTagging?"btn-warning":""),onClick:()=>f("addressTagging","Good"),children:"Good"}),(0,h.jsx)("button",{className:"btn me-2 ".concat("Excellent"===w.addressTagging?"btn-primary":""),onClick:()=>f("addressTagging","Excellent"),children:"Excellent"})]})})]}),(0,h.jsxs)("div",{className:"row mb-3",children:[(0,h.jsx)("div",{className:"col-6",children:(0,h.jsx)("label",{className:"form-label",htmlFor:"callHandlingTime",children:"5) Call Handled Time"})}),(0,h.jsx)("div",{className:"col-6",children:(0,h.jsxs)("div",{children:[(0,h.jsx)("button",{className:"btn me-2 ".concat("Poor"===w.callHandlingTime?"btn-danger":""),onClick:()=>f("callHandlingTime","Poor"),children:"Poor"}),(0,h.jsx)("button",{className:"btn me-2 ".concat("Good"===w.callHandlingTime?"btn-warning":""),onClick:()=>f("callHandlingTime","Good"),children:"Good"}),(0,h.jsx)("button",{className:"btn me-2 ".concat("Excellent"===w.callHandlingTime?"btn-primary":""),onClick:()=>f("callHandlingTime","Excellent"),children:"Excellent"})]})})]})]}),(0,h.jsxs)("div",{className:"form-group-row",children:[(0,h.jsx)("label",{className:"col-6",htmlFor:"remark",children:"Remark (Optional)"}),(0,h.jsx)("textarea",{className:"form-control",id:"remark",rows:"3",value:w.remark,onChange:e=>C((n=>({...n,remark:e.target.value})))})]}),(0,h.jsx)("button",{className:"btn btn-primary mt-3 mb-2",onClick:e=>{e.preventDefault(),console.log("Submitted answers:",w);const n={...w,eventId:u};console.log(n),fetch("your-api-endpoint",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(n)}).then((e=>e.json())).then((e=>{m().fire({icon:"success",title:"Submitted Successfully!",text:"Response Submitted successfully "})})).catch((e=>{m().fire({icon:"error",title:"Failed",text:"There was an error updating the data. Please try again."})}))},children:"Submit"})]})})]})})]})})]})})})}}}]);
//# sourceMappingURL=381.109e9688.chunk.js.map