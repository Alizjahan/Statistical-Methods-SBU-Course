import {updateChart,updateText} from './motion.js';
// Numerical routines are shared by every view; no network or student data required.
export const fa = (x, digits=2) => Number(x).toLocaleString('fa-IR',{maximumFractionDigits:digits});
export const normalPDF = x => Math.exp(-x*x/2)/Math.sqrt(2*Math.PI);
export function normalCDF(x){const a=Math.abs(x),t=1/(1+.2316419*a),d=normalPDF(a);const p=1-d*t*(.319381530+t*(-.356563782+t*(1.781477937+t*(-1.821255978+t*1.330274429))));return x>=0?p:1-p;}
export function quantile(fn,p,lo=-12,hi=12){for(let i=0;i<85;i++){const m=(lo+hi)/2;if(fn(m)<p)lo=m;else hi=m;}return(lo+hi)/2;}
export const normalQuantile=p=>quantile(normalCDF,p);
export function logGamma(z){const a=[676.5203681218851,-1259.1392167224028,771.3234287776531,-176.6150291621406,12.507343278686905,-.13857109526572012,9.984369578019572e-6,1.5056327351493116e-7];if(z<.5)return Math.log(Math.PI)-Math.log(Math.sin(Math.PI*z))-logGamma(1-z);z--;let x=.99999999999980993;for(let i=0;i<a.length;i++)x+=a[i]/(z+i+1);const t=z+7.5;return .5*Math.log(2*Math.PI)+(z+.5)*Math.log(t)-t+Math.log(x);}
export function gammaP(a,x){if(x<=0)return 0;const f=Math.exp(a*Math.log(x)-x-logGamma(a));if(x<a+1){let sum=1/a,term=sum;for(let n=1;n<600;n++){term*=x/(a+n);sum+=term;if(Math.abs(term)<Math.abs(sum)*1e-14)break;}return Math.min(1,sum*f);}let b=x+1-a,c=1e30,d=1/b,h=d;for(let i=1;i<600;i++){const an=-i*(i-a);b+=2;d=an*d+b;if(Math.abs(d)<1e-30)d=1e-30;c=b+an/c;if(Math.abs(c)<1e-30)c=1e-30;d=1/d;const v=d*c;h*=v;if(Math.abs(v-1)<1e-14)break;}return Math.max(0,1-f*h);}
export const chiCDF=(x,df)=>gammaP(df/2,x/2);
export const chiPDF=(x,df)=>x===0&&df===2?.5:x>0?Math.exp((df/2-1)*Math.log(x)-x/2-df/2*Math.log(2)-logGamma(df/2)):0;
export const tPDF=(x,df)=>Math.exp(logGamma((df+1)/2)-logGamma(df/2))/Math.sqrt(df*Math.PI)*Math.pow(1+x*x/df,-(df+1)/2);
export const chiQuantile=(p,df)=>quantile(x=>chiCDF(x,df),p,0,df+20*Math.sqrt(2*df)+100);
export const binomialPMF=(k,n,p)=>p===0?(k===0?1:0):p===1?(k===n?1:0):Math.exp(logGamma(n+1)-logGamma(k+1)-logGamma(n-k+1)+k*Math.log(p)+(n-k)*Math.log(1-p));
export const seedRandom=seed=>()=>{let t=seed+=0x6D2B79F5;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296;};
export const gaussian=r=>Math.sqrt(-2*Math.log(Math.max(r(),1e-15)))*Math.cos(2*Math.PI*r());
export const mean=xs=>xs.reduce((a,b)=>a+b,0)/xs.length;
const esc=x=>String(x).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const colors={green:'#377e6b',light:'#b4cdb5',gold:'#b88b50',red:'#b65d50',blue:'#5d839b',grid:'#d6dfd5'};
const path=points=>points.map((p,i)=>(i?'L':'M')+p.map(x=>x.toFixed(2)).join(',')).join(' ');
export function densitySVG({fn=normalPDF,min=-4,max=4,regions=[],markers=[],curves=[],label='نمودار توزیع',ymax,xticks=6}){
 const W=650,H=285,L=45,R=25,T=30,B=43,w=W-L-R,h=H-T-B;
 const vals=Array.from({length:251},(_,i)=>{const x=min+(max-min)*i/250;return[x,fn(x)];});
 const peak=ymax||Math.max(...vals.map(p=>p[1]),...curves.flatMap(c=>vals.map(p=>c.fn(p[0]))))*1.18;
 const sx=x=>L+(x-min)/(max-min)*w,sy=y=>T+h-y/peak*h;
 let out=`<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(label)}"><title>${esc(label)}</title>`;
 for(let i=1;i<=3;i++){const y=peak*i/4;out+=`<path d="M${L} ${sy(y)}H${W-R}" stroke="${colors.grid}" stroke-dasharray="3 5" opacity=".55"/>`;}
 for(const r of regions){const lo=Math.max(min,r.lo),hi=Math.min(max,r.hi);if(hi<=lo)continue;const f=r.fn||fn,pts=Array.from({length:121},(_,i)=>{let x=lo+(hi-lo)*i/120;return[sx(x),sy(f(x))];});out+=`<path d="${path([[sx(lo),sy(0)],...pts,[sx(hi),sy(0)]])}Z" fill="${r.color||colors.light}" opacity=".6"/>`;}
 out+=`<path d="M${L} ${sy(0)}H${W-R}" stroke="${colors.grid}"/><path d="${path(vals.map(([x,y])=>[sx(x),sy(y)]))}" fill="none" stroke="${colors.green}" stroke-width="2.5"/>`;
 for(const c of curves)out+=`<path d="${path(vals.map(([x])=>[sx(x),sy(c.fn(x))]))}" fill="none" stroke="${c.color||colors.blue}" stroke-width="2.3"/>`;
 for(let i=0;i<=xticks;i++){const x=min+(max-min)*i/xticks;out+=`<text x="${sx(x)}" y="${H-16}" text-anchor="middle">${fa(x,1)}</text>`;}
 for(const m of markers){if(m.x<min||m.x>max)continue;out+=`<path d="M${sx(m.x)} ${T+8}V${sy(0)}" stroke="${m.color||colors.gold}" stroke-dasharray="5 4"/><text x="${sx(m.x)}" y="${m.labelY??T-8}" text-anchor="middle" style="fill:${m.color||colors.gold};font-size:11px">${esc(m.text||fa(m.x))}</text>`;}
 return out+'</svg>';
}
export const LABS=[
 {id:'probability',title:'احتمال، از شمارش تا مساحت',desc:'دوجمله‌ای و احتمال تجمعی',chapter:1,section:'تابع احتمال'},
 {id:'normal',title:'یک خانواده، هزار شکل',desc:'تغییر میانگین و انحراف معیار',chapter:1,section:'توزیع‌های پرکاربرد'},
 {id:'estimators',title:'اریبی در برابر پراکندگی',desc:'مقایسهٔ خطای میانگین مربعات',chapter:2,section:'خطای میانگین مربعات'},
 {id:'clt',title:'وقتی میانگین‌ها نرمال می‌شوند',desc:'تجربهٔ قضیهٔ حد مرکزی',chapter:3,section:'قضیهٔ حد مرکزی'},
 {id:'coverage',title:'۹۵ درصد واقعاً یعنی چه؟',desc:'تکرار نمونه‌گیری و پوشش بازه‌ها',chapter:3,section:'منطق فاصله'},
 {id:'variance',title:'عدم‌قطعیت دربارهٔ واریانس',desc:'توزیع کای‌دو و درجات آزادی',chapter:3,section:'فاصلهٔ اطمینان واریانس'},
 {id:'paired',title:'چرا زوج‌ها را کنار هم نگه داریم؟',desc:'اثر همبستگی بر خطای استاندارد',chapter:3,section:'داده‌های زوجی'},
 {id:'hypothesis',title:'از ناحیهٔ رد تا مقدار p',desc:'جهت آزمون و تصمیم آماری',chapter:4,section:'مقدار احتمالی'},
 {id:'power',title:'دو خطا، یک تصمیم',desc:'رابطهٔ آلفا، بتا و توان',chapter:4,section:'خطاهای نوع اول'}
];
let serial=0;
const control=(id,key,title,min,max,step,value)=>`<div class="lab-control"><label for="${id}-${key}">${title}<output data-value="${key}">${fa(value)}</output></label><input id="${id}-${key}" data-key="${key}" type="range" min="${min}" max="${max}" step="${step}" value="${value}"></div>`;
const select=(id,key,title,options)=>`<div class="lab-control"><label for="${id}-${key}">${title}</label><select id="${id}-${key}" data-key="${key}">${options.map(([v,l])=>`<option value="${v}">${l}</option>`).join('')}</select></div>`;
const stat=(title,value)=>`<div class="lab-stat"><span>${title}</span><strong>${value}</strong></div>`;
export function renderLab(kind,mount){
 const meta=LABS.find(l=>l.id===kind);if(!meta)return;
 const id='lab-'+(++serial), c=(...a)=>control(id,...a),s=(...a)=>select(id,...a);
 let controls='',question='',buttons='';
 if(kind==='probability'){question='در n آزمایش مستقل با احتمال موفقیت p، احتمالِ حداکثر k موفقیت چقدر است؟ ستون‌های سبز همان احتمال تجمعی را می‌سازند.';controls=c('n','تعداد آزمایش‌ها n',2,40,1,10)+c('p','احتمال موفقیت p',.05,.95,.05,.5)+c('k','حد بالای موفقیت‌ها k',0,40,1,5);}
 if(kind==='normal'){question='میانگین جای منحنی را عوض می‌کند؛ انحراف معیار، پهنای آن را. احتمالِ قرار گرفتن X در بازهٔ ثابتِ [−۱، ۱] را دنبال کنید.';controls=c('mu','میانگین μ',-3,3,.1,0)+c('sigma','انحراف معیار σ',.3,2.5,.1,1);}
 if(kind==='estimators'){question='جامعه نرمال با میانگین واقعی ۲ و واریانس ۱ است. میانگین نمونه را با برآوردگر کوچک‌شدهٔ cX̄ مقایسه کنید: آیا کاهش واریانس همیشه بهتر است؟';controls=c('n','حجم نمونه n',2,100,1,10)+c('c','ضریب کوچک‌سازی c',.1,1,.05,.75);}
 if(kind==='clt'){question='هر ستون، میانگین یک نمونه نیست؛ تعداد میانگین‌های استانداردشده در آن بازه را نشان می‌دهد. برای هر نمودار ۱۲۰۰ نمونهٔ تازه تولید می‌شود. منحنی سبز نرمال استاندارد است.';controls=s('dist','توزیع جامعه',[['exp','نمایی (چوله به راست)'],['uniform','یکنواخت'],['bernoulli','برنولی با p = ۰٫۲']])+c('n','تعداد مشاهدات هر نمونه n',1,100,1,1);buttons='<button class="primary" data-action="resample">↻ نمونه‌گیری دوباره</button>';}
 if(kind==='coverage'){question='میانگین واقعی جامعه ۰ و انحراف معیار معلوم ۱ است. هر خط از یک نمونهٔ مستقل ساخته می‌شود. بازه‌ای که صفر را نپوشاند نارنجی است؛ پوششِ هر اجرای شبیه‌سازی می‌تواند با سطح اسمی فرق داشته باشد.';controls=c('n','حجم هر نمونه n',2,100,1,20)+s('confidence','سطح اطمینان',[['.95','۹۵ درصد'],['.90','۹۰ درصد'],['.99','۹۹ درصد']]);buttons='<button class="primary" data-action="resample">↻ تولید ۶۰ بازهٔ تازه</button>';}
 if(kind==='variance'){question='نمونه از یک جامعهٔ نرمال مستقل گرفته شده و میانگین جامعه نامعلوم است. با تغییر n، هم شکل توزیع کای‌دو و هم فاصلهٔ اطمینان ۹۵ درصد واریانس تغییر می‌کند.';controls=c('n','حجم نمونه n',3,100,1,10)+c('s2','واریانس مشاهده‌شده S²',.5,15,.5,5);}
 if(kind==='paired'){question='در این مثال آموزشی، دو اندازه‌گیری نرمال با انحراف معیار معلومِ ۳ داریم و اختلاف میانگین مشاهده‌شده ۰٫۸ است. با ثابت نگه داشتن پراکندگی هر متغیر، همبستگی چه اثری بر بازهٔ اختلاف دارد؟';controls=c('n','تعداد زوج‌ها n',5,80,1,20)+c('rho','همبستگی داخل زوج ρ',-.8,.95,.05,.6);}
 if(kind==='hypothesis'){question='مثال ضخامت محصول: میانگین فرض صفر ۵۰۰ و انحراف معیار معلوم ۲۰ است. نمودار توزیع Z را تحت فرض صفر نشان می‌دهد. سطح آزمون و جهت فرض مقابل را تغییر دهید.';controls=c('x','میانگین نمونه x̄',485,515,.5,508)+c('n','حجم نمونه n',5,100,1,25)+s('alpha','سطح خطای نوع اول α',[['.05','۵ درصد'],['.01','۱ درصد'],['.10','۱۰ درصد']])+s('tail','فرض مقابل',[['right','افزایش: μ > ۵۰۰'],['two','تغییر: μ ≠ ۵۰۰'],['left','کاهش: μ < ۵۰۰']]);}
 if(kind==='power'){question='آزمون راست‌طرفه با واریانس معلوم: منحنی سبز برای فرض صفر و منحنی آبی برای یک میانگین بزرگ‌تر است. اندازهٔ اثر δ، اختلاف میانگین‌ها بر حسب انحراف معیار جامعه است.';controls=c('n','حجم نمونه n',5,100,1,25)+c('effect','اندازهٔ اثر δ',.05,1,.05,.4)+s('alpha','سطح آزمون α',[['.05','۵ درصد'],['.01','۱ درصد'],['.10','۱۰ درصد']]);}
 mount.dataset.labInstance=id;
 mount.innerHTML=`<div class="lab" data-lab="${kind}"><div class="lab-heading"><div><span>آزمایشگاه تعاملی</span><h3>${meta.title}</h3></div><span class="lab-tag">تغییر دهید و ببینید</span></div><div class="lab-body"><p class="lab-question">${question}</p><div class="lab-controls">${controls}</div>${buttons?'<div class="lab-buttons">'+buttons+'</div>':''}<div class="lab-chart"></div><div class="lab-stats" aria-live="polite"></div><div class="lab-explain"></div></div></div>`;
 const chart=mount.querySelector('.lab-chart'),stats=mount.querySelector('.lab-stats'),explain=mount.querySelector('.lab-explain');let seed=73421;
 const get=key=>mount.querySelector(`[data-key="${key}"]`).value;
 function update(){
  for(const input of mount.querySelectorAll('input[data-key]'))mount.querySelector(`[data-value="${input.dataset.key}"]`).textContent=fa(+input.value);
  const n=+getOptional('n',10),r=seedRandom(seed);
  function getOptional(k,def){return mount.querySelector(`[data-key="${k}"]`)?.value??def;}
  if(kind==='probability'){
   const p=+get('p'),kInput=mount.querySelector('[data-key="k"]');kInput.max=n;if(+kInput.value>n)kInput.value=n;const k=+kInput.value;mount.querySelector('[data-value="k"]').textContent=fa(k);
   let cumulative=0;const vals=Array.from({length:n+1},(_,i)=>{const v=binomialPMF(i,n,p);if(i<=k)cumulative+=v;return v;}),max=Math.max(...vals)*1.15;
   updateChart(chart,bars(vals,{min:0,max:n+1,peak:max,highlight:k,label:'احتمال تعداد موفقیت‌ها در توزیع دوجمله‌ای',discrete:true}));
   updateText(stats,stat('P(X ≤ k)',fa(cumulative,4))+stat('امید ریاضی np',fa(n*p))+stat('واریانس np(1−p)',fa(n*p*(1-p))));
   explain.innerHTML=`احتمال حداکثر ${fa(k)} موفقیت برابر <strong>${fa(cumulative*100)}٪</strong> است. ستون‌ها احتمال نقاط گسسته‌اند؛ جمع ارتفاع ستون‌های سبز، احتمال انتخاب‌شده است.`;
  }
  if(kind==='normal'){
   const mu=+get('mu'),sigma=+get('sigma'),p=normalCDF((1-mu)/sigma)-normalCDF((-1-mu)/sigma);
   updateChart(chart,densitySVG({fn:x=>normalPDF((x-mu)/sigma)/sigma,min:-8,max:8,regions:[{lo:-1,hi:1}],markers:[{x:mu,text:'μ = '+fa(mu)},{x:-1,text:'−۱'},{x:1,text:'۱'}],label:'چگالی نرمال با میانگین و انحراف معیار قابل تغییر',xticks:8}));
   updateText(stats,stat('احتمال بازهٔ [−۱، ۱]',fa(p*100)+'٪')+stat('واریانس σ²',fa(sigma*sigma))+stat('ارتفاع قله',fa(normalPDF(0)/sigma,3)));
   explain.innerHTML='مساحت کل زیر منحنی همیشه <strong>۱</strong> است. وقتی σ بزرگ‌تر می‌شود، منحنی پهن‌تر و قله کوتاه‌تر می‌شود. ناحیهٔ رنگی در محور X ثابت است.';
  }
  if(kind==='estimators'){
   const c=+get('c'),sd=1/Math.sqrt(n),bias=2*(c-1),mse=c*c/n+bias*bias;
   const fn=x=>normalPDF((x-2)/sd)/sd,other=x=>normalPDF((x-2*c)/(c*sd))/(c*sd);
   updateChart(chart,densitySVG({fn,min:Math.min(0,2*c-4*c*sd),max:3.5,curves:[{fn:other}],markers:[{x:2,text:'θ = ۲'}],label:'توزیع نمونه‌ای دو برآوردگر؛ سبز میانگین و آبی میانگین کوچک‌شده'}));
   updateText(stats,stat('MSE میانگین (سبز)',fa(1/n,4))+stat('MSE کوچک‌شده (آبی)',fa(mse,4))+stat('اریبی کوچک‌شده',fa(bias,3)));
   explain.innerHTML=`منحنی سبز: X̄، منحنی آبی: cX̄. در این انتخاب، <strong>${mse<1/n?'برآوردگر کوچک‌شده':'میانگین نمونه'}</strong> خطای میانگین مربعات کمتری دارد. رابطهٔ اصلی: MSE = واریانس + مجذور اریبی؛ با افزایش n، هزینهٔ اریبی برجسته‌تر می‌شود.`;
  }
  if(kind==='clt'){
   const dist=get('dist'),mu=dist==='exp'?1:dist==='uniform'?.5:.2,variance=dist==='exp'?1:dist==='uniform'?1/12:.16;
   const data=[];for(let j=0;j<1200;j++){let sum=0;for(let i=0;i<n;i++){const u=r();sum+=dist==='exp'?-Math.log(1-u):dist==='uniform'?u:(u<.2?1:0);}data.push((sum/n-mu)/Math.sqrt(variance/n));}
   const min=-4,max=5,count=36,vals=new Array(count).fill(0),width=(max-min)/count;for(const x of data){const i=Math.floor((x-min)/width);if(i>=0&&i<count)vals[i]++;}const densities=vals.map(v=>v/data.length/width);
   updateChart(chart,bars(densities,{min,max,peak:Math.max(.52,...densities)*1.1,curve:normalPDF,label:'هیستوگرام میانگین‌های استانداردشده و منحنی نرمال استاندارد'}));
   updateText(stats,stat('تعداد تکرار',fa(data.length))+stat('میانگین Zها',fa(mean(data),3))+stat('انحراف معیار Zها',fa(Math.sqrt(mean(data.map(x=>(x-mean(data))**2))),3)));
   explain.innerHTML=`استانداردسازی: <span dir="ltr">Z = (X̄ − μ) / (σ / √n)</span>. با بزرگ شدن n، شکل توزیع این کمیت به نرمال نزدیک می‌شود. ${dist==='bernoulli'?'برای برنولی با n کوچک، گسسته بودن کاملاً دیده می‌شود. ':''}حدود محور نمودار ثابت است؛ نمونه‌های بیرون [−۴، ۵] نمایش داده نمی‌شوند، اما در محاسبهٔ آمار دخیل‌اند.`;
  }
  if(kind==='coverage'){
   const confidence=+get('confidence'),z=normalQuantile((1+confidence)/2),se=1/Math.sqrt(n),half=z*se;
   const data=Array.from({length:60},()=>{const m=gaussian(r)*se;return{lo:m-half,hi:m+half,ok:Math.abs(m)<=half};}),hit=data.filter(x=>x.ok).length;
   const lim=3.5,xx=x=>45+(x+lim)/(2*lim)*560;let svg='<svg viewBox="0 0 650 420" role="img" aria-label="شصت فاصلهٔ اطمینان؛ سبز پوشانندهٔ میانگین واقعی و نارنجی ناپوشاننده">';
   svg+=`<path d="M${xx(0)} 16V390" stroke="${colors.gold}" stroke-dasharray="4 4"/><text x="${xx(0)}" y="410" text-anchor="middle">μ = ۰</text>`;
   data.forEach((d,i)=>{const y=20+i*6.1;svg+=`<path d="M${xx(d.lo)} ${y}H${xx(d.hi)}" stroke="${d.ok?colors.green:colors.red}" stroke-width="2.5"/><circle cx="${xx((d.lo+d.hi)/2)}" cy="${y}" r="1.9" fill="${d.ok?colors.green:colors.red}"/>`;});
   updateChart(chart,svg+'</svg>');updateText(stats,stat('پوشش این اجرا',fa(hit/60*100)+'٪')+stat('بازهٔ پوشاننده',fa(hit)+' / '+fa(60))+stat('طول هر بازه',fa(2*half,3)));
   explain.innerHTML=`در این اجرا <strong>${fa(60-hit)} بازه</strong> میانگین واقعی را نپوشانده‌اند. ${fa(confidence*100)} درصد دربارهٔ روش ساخت بازه در تکرارهای بسیار زیاد است؛ برای یک بازهٔ محاسبه‌شده، پارامتر ثابت داخل آن هست یا نیست. افزایش n طول بازه را کاهش می‌دهد.`;
  }
  if(kind==='variance'){
   const df=n-1,s2=+get('s2'),qlo=chiQuantile(.025,df),qhi=chiQuantile(.975,df),lo=df*s2/qhi,hi=df*s2/qlo;
   updateChart(chart,densitySVG({fn:x=>chiPDF(x,df),min:0,max:Math.max(qhi*1.25,10),regions:[{lo:qlo,hi:qhi}],markers:[{x:qlo,text:'χ²₀.₀₂₅'},{x:qhi,text:'χ²₀.₉₇₅'}],label:'توزیع کای‌دو و ناحیهٔ میانی ۹۵ درصد'}));
   updateText(stats,stat('درجات آزادی n−1',fa(df))+stat('کران پایین واریانس',fa(lo,3))+stat('کران بالای واریانس',fa(hi,3)));
   explain.innerHTML='کمیت محوری <span dir="ltr">(n−1)S² / σ²</span> توزیع کای‌دو دارد. برای ساخت بازهٔ σ²، تقسیم بر چندک بزرگ‌تر کران پایین را می‌دهد. این فاصله به فرض <strong>نرمال بودن جامعه</strong> وابسته است؛ تغییر S² شکل توزیع مرجع را عوض نمی‌کند.';
  }
  if(kind==='paired'){
   const rho=+get('rho'),paired=Math.sqrt(18*(1-rho)/n),independent=Math.sqrt(18/n),z=normalQuantile(.975),lim=Math.max(3,z*independent+.8+.4),sx=x=>55+(x+lim)/(2*lim)*540;
   let svg='<svg viewBox="0 0 650 230" role="img" aria-label="مقایسهٔ بازه‌های اختلاف میانگین با لحاظ همبستگی و با فرض استقلال">';
   svg+=`<path d="M${sx(0)} 25V190" stroke="${colors.gold}" stroke-dasharray="4 4"/>`;
   [[paired,85,colors.green,'مدل زوجی'],[independent,155,colors.blue,'فرض استقلال']].forEach(([se,y,color,title])=>{svg+=`<text x="${sx(.8)}" y="${y-24}" text-anchor="middle">${title}</text><path d="M${sx(.8-z*se)} ${y}H${sx(.8+z*se)}" stroke="${color}" stroke-width="5" stroke-linecap="round"/><circle cx="${sx(.8)}" cy="${y}" r="6" fill="${color}"/>`;});
   for(let i=-2;i<=2;i++)svg+=`<text x="${sx(i)}" y="215" text-anchor="middle">${fa(i)}</text>`;
   updateChart(chart,svg+'</svg>');updateText(stats,stat('SE زوجی',fa(paired,3))+stat('SE با فرض استقلال',fa(independent,3))+stat('نسبت طول دو بازه',fa(paired/independent,3)));
   explain.innerHTML='خطای استاندارد زوجی از <span dir="ltr">Var(X−Y) = Var(X) + Var(Y) − 2Cov(X,Y)</span> به دست می‌آید. همبستگی مثبت طول بازه را کم می‌کند؛ همبستگی منفی می‌تواند آن را بیشتر کند. این نمایش با واریانس‌های <strong>معلوم</strong> است؛ برای واریانس نامعلوم به اختلاف‌های نمونه و توزیع t نیاز داریم.';
  }
  if(kind==='hypothesis'){
   const x=+get('x'),a=+get('alpha'),tail=get('tail'),z=(x-500)/(20/Math.sqrt(n)),crit=normalQuantile(1-(tail==='two'?a/2:a));let p,regions;
   if(tail==='right'){p=1-normalCDF(z);regions=[{lo:crit,hi:8,color:colors.red}];}
   else if(tail==='left'){p=normalCDF(z);regions=[{lo:-8,hi:-crit,color:colors.red}];}
   else{p=2*(1-normalCDF(Math.abs(z)));regions=[{lo:-8,hi:-crit,color:colors.red},{lo:crit,hi:8,color:colors.red}];}
   const pRegions=tail==='right'?[{lo:z,hi:8,color:colors.light}]:tail==='left'?[{lo:-8,hi:z,color:colors.light}]:[{lo:-8,hi:-Math.abs(z),color:colors.light},{lo:Math.abs(z),hi:8,color:colors.light}];
   const lim=Math.max(4,Math.abs(z)+.7);updateChart(chart,densitySVG({min:-lim,max:lim,regions:[...regions,...pRegions],markers:[{x:z,text:'Z = '+fa(z),color:colors.blue}],label:'توزیع آماره تحت فرض صفر؛ قرمز ناحیهٔ رد و سبز مساحت مقدار p'}));
   updateText(stats,stat('آمارهٔ مشاهده‌شده Z',fa(z,3))+stat('مقدار p',fa(p,5))+stat('تصمیم در سطح انتخابی',p<=a?'رد H₀':'رد نکردن H₀'));
   explain.innerHTML=`قرمز: ناحیهٔ رد با α = ${fa(a)}. سبز کم‌رنگ: ناحیهٔ مربوط به مقدار p (ممکن است با قرمز هم‌پوشانی داشته باشد). <strong>p ${p<=a?'≤':'>'} α</strong>؛ پس فرض صفر ${p<=a?'رد می‌شود':'رد نمی‌شود'}. مقدار p احتمال درست بودن فرض صفر نیست.`;
  }
  if(kind==='power'){
   const a=+get('alpha'),effect=+get('effect'),delta=effect*Math.sqrt(n),c=normalQuantile(1-a),beta=normalCDF(c-delta),power=1-beta,fn=x=>normalPDF(x-delta);
   updateChart(chart,densitySVG({min:-4,max:Math.max(6,delta+4),regions:[{lo:c,hi:20,color:colors.red},{lo:-4,hi:c,fn,color:colors.blue}],curves:[{fn}],markers:[{x:c,text:'حد بحرانی'}],label:'خطای نوع اول زیر فرض صفر و خطای نوع دوم زیر یک فرض مقابل مشخص'}));
   updateText(stats,stat('خطای نوع اول α',fa(a*100)+'٪')+stat('خطای نوع دوم β',fa(beta*100)+'٪')+stat('توان ۱−β',fa(power*100)+'٪'));
   explain.innerHTML='سبز: توزیع تحت H₀، آبی: توزیع تحت مقدار مشخصِ H₁. بخش قرمز زیر H₀ خطای نوع اول است؛ بخش آبی در چپ حد بحرانی خطای نوع دوم است. افزایش n یا اندازهٔ اثر، <strong>توان کشف اثر</strong> را بیشتر می‌کند. کاهش α با n ثابت، معمولاً توان را کاهش می‌دهد.';
  }
 }
 let pendingUpdate;const scheduleUpdate=()=>{if(pendingUpdate)return;pendingUpdate=requestAnimationFrame(()=>{pendingUpdate=null;if(mount.isConnected&&mount.dataset.labInstance===id)update();});};
 mount.oninput=scheduleUpdate;mount.onchange=scheduleUpdate;
 mount.querySelector('[data-action="resample"]')?.addEventListener('click',()=>{seed+=7919;update();});update();
}
function bars(vals,{min,max,peak,highlight,discrete=false,curve,label}){
 const W=650,H=285,L=45,T=25,B=40,w=580,h=H-T-B,bw=w/vals.length;let svg=`<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(label)}"><title>${esc(label)}</title>`;
 vals.forEach((v,i)=>{const height=v/peak*h;svg+=`<rect x="${L+i*bw+1}" y="${T+h-height}" width="${Math.max(1,bw-2)}" height="${height}" rx="1" fill="${highlight===undefined||i<=highlight?colors.light:'#dee3df'}"/>`;});
 if(curve){const pts=Array.from({length:251},(_,i)=>{const x=min+(max-min)*i/250;return[L+(x-min)/(max-min)*w,T+h-curve(x)/peak*h];});svg+=`<path d="${path(pts)}" stroke="${colors.green}" stroke-width="2.5" fill="none"/>`;}
 svg+=`<path d="M${L} ${T+h}H${L+w}" stroke="${colors.grid}"/>`;
 const ticks=discrete?Math.min(vals.length-1,8):6;for(let i=0;i<=ticks;i++){const x=discrete?Math.round((vals.length-1)*i/ticks):min+(max-min)*i/ticks,sx=discrete?L+(x+.5)*bw:L+(x-min)/(max-min)*w;svg+=`<text x="${sx}" y="${H-15}" text-anchor="middle">${fa(x,1)}</text>`;}
 return svg+'</svg>';
}
