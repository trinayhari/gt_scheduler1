/* All section times, locations and instructors below are fictional demonstration data. */
(function(root){
'use strict';
const definitions=[
 ['CS1332','CS 1332','Data Structures & Algorithms',3,'Computing','#6b9cc5',['CS 1331'],[[[0,2,4],600,650],[[1,3],660,735],[[0,2],840,915]]],
 ['CS2050','CS 2050','Introduction to Discrete Mathematics',3,'Computing','#a08ac2',['CS 1301'],[[[0,2,4],660,710],[[1,3],570,645],[[1,3],840,915]]],
 ['CS2110','CS 2110','Computer Organization & Programming',4,'Computing','#79a18a',['CS 1331'],[[[1,3],750,825],[[0,2,4],780,830],[[1,3],930,1005]]],
 ['MATH2550','MATH 2550','Introduction to Multivariable Calculus',2,'Math','#c4a45d',['MATH 1552'],[[[0,2],720,770],[[1,3],660,710],[[0,2],900,950]]],
 ['ENGL1102','ENGL 1102','English Composition II',3,'Humanities','#c28ba3',['ENGL 1101'],[[[1,3],570,645],[[0,2,4],840,890],[[1,3],840,915]]],
 ['APPH1040','APPH 1040','Scientific Foundations of Health',2,'Wellness','#67a8a5',[],[[[0,2],900,950],[[1,3],510,560],[[1,3],990,1040]]],
 ['CS2340','CS 2340','Objects & Design',3,'Computing','#8298c2',['CS 1332'],[[[0,2,4],540,590],[[1,3],750,825],[[0,2],960,1035]]],
 ['PSYC1101','PSYC 1101','General Psychology',3,'Social science','#c89778',[],[[[0,2,4],720,770],[[1,3],930,1005],[[0,2],570,645]]]
];
const sampleCourses=definitions.map(([id,code,title,credits,area,color,prereqs,times])=>({id,code,title,credits,area,color,prereqs,sections:times.map(([days,start,end],i)=>({id:id+'-'+String.fromCharCode(65+i),courseId:id,code,title,credits,area,color,label:String.fromCharCode(65+i),instructor:'Illustrative section',location:'Sample location',meetings:[{days,start,end}]}))}));
let courses=sampleCourses;
const norm=s=>String(s).replace(/[^A-Za-z0-9]/g,'').toUpperCase();
const defaults={earliest:480,latest:1080,freeDay:-1,gapWeight:'balanced',buffer:0,avoidFriday:false};
function preferences(p){return {...defaults,...p,earliest:Number(p?.earliest??480),latest:Number(p?.latest??1080),freeDay:Number(p?.freeDay??-1),buffer:Math.max(0,Number(p?.buffer??0))};}
function overlaps(a,b,buffer=0){return a.meetings.some(x=>b.meetings.some(y=>x.days.some(d=>y.days.includes(d))&&x.start<y.end+buffer&&y.start<x.end+buffer));}
function analyze(sections,prefs={}){
 const p=preferences(prefs),conflicts=[],preferenceIssues=[],dayMeetings=[[],[],[],[],[]];
 sections.forEach(s=>s.meetings.forEach(m=>m.days.forEach(d=>{dayMeetings[d].push({...m,section:s});if(m.start<p.earliest||m.end>p.latest)preferenceIssues.push(s.code+' is outside preferred hours');if(d===p.freeDay)preferenceIssues.push(s.code+' meets on your requested free day');})));
 for(let i=0;i<sections.length;i++)for(let j=i+1;j<sections.length;j++)for(const a of sections[i].meetings)for(const b of sections[j].meetings)for(const day of a.days)if(b.days.includes(day)&&a.start<b.end+p.buffer&&b.start<a.end+p.buffer)conflicts.push({a:sections[i].id,b:sections[j].id,day});
 let gapMinutes=0,daysOnCampus=0,earliest=1440,latest=0;
 dayMeetings.forEach(ms=>{if(!ms.length)return;daysOnCampus++;ms.sort((a,b)=>a.start-b.start);let occupiedUntil=ms[0].end;ms.forEach((m,i)=>{earliest=Math.min(earliest,m.start);latest=Math.max(latest,m.end);if(i){gapMinutes+=Math.max(0,m.start-occupiedUntil);occupiedUntil=Math.max(occupiedUntil,m.end);}});});
 const friday=dayMeetings[4].length>0;
 const penalty=conflicts.length*40+preferenceIssues.length*20+gapMinutes/(p.gapWeight==='compact'?12:30)+(p.gapWeight==='compact'?daysOnCampus*3:0)+(p.avoidFriday&&friday?20:0);
 return {credits:sections.reduce((n,s)=>n+(s.credits||0),0),conflicts,daysOnCampus,gapMinutes,earliest:sections.length?earliest:null,latest:sections.length?latest:null,score:Math.max(0,Math.round(100-penalty)),preferenceIssues:[...new Set(preferenceIssues)]};
}
function generate(courseIds,prefs={},completed=[]){
 const p=preferences(prefs),done=new Set(completed.map(norm));
 const selected=[...new Set(courseIds.map(norm))].filter(id=>!done.has(id)).map(id=>courses.find(c=>c.id===id)).filter(Boolean);
 if(!selected.length||selected.length>12)return [];
 const options=selected.map(c=>c.sections.filter(s=>s.meetings.every(m=>m.start>=p.earliest&&m.end<=p.latest&&!m.days.includes(p.freeDay))));
 if(options.some(x=>!x.length))return [];
 let visits=0;const results=[];
 function walk(i,list){if(++visits>50000)return;if(i===options.length){const metrics=analyze(list,p);results.push({sections:[...list],score:metrics.score,metrics});return;}for(const s of options[i])if(list.every(x=>!overlaps(x,s,p.buffer)))walk(i+1,[...list,s]);}
 walk(0,[]);const best=results.sort((a,b)=>b.score-a.score||a.metrics.gapMinutes-b.metrics.gapMinutes).slice(0,5);best.forEach(r=>{r.searchTruncated=visits>50000;});best.truncated=visits>50000;best.visits=visits;return best;
}
function parseCompleted(text){return [...new Set((String(text).toUpperCase().match(/\b[A-Z]{2,5}[\s-]*\d{4}[A-Z]?\b/g)||[]).map(norm))];}
const pad=n=>String(n).padStart(2,'0');
function localDate(d,minutes){return d.getUTCFullYear()+pad(d.getUTCMonth()+1)+pad(d.getUTCDate())+'T'+pad(Math.floor(minutes/60))+pad(minutes%60)+'00';}
function date(s){if(!/^\d{4}-\d{2}-\d{2}$/.test(s))throw Error('Use a date in YYYY-MM-DD format.');const d=new Date(s+'T00:00:00Z');if(!Number.isFinite(d.getTime())||d.toISOString().slice(0,10)!==s)throw Error('Choose a valid date.');return d;}
function escape(s){return String(s).replace(/\\/g,'\\\\').replace(/\n/g,'\\n').replace(/,/g,'\\,').replace(/;/g,'\\;');}
function exportICS(sections,startDate,endDate){
 const start=date(startDate),end=date(endDate);if(end<start)throw Error('End date must follow the start date.');
 const lines=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//BuzzPlan//Sample Schedule//EN','CALSCALE:GREGORIAN','METHOD:PUBLISH','X-WR-CALNAME:BuzzPlan '+(sections.some(s=>s.realData)?'schedule snapshot':'sample schedule'),'X-WR-TIMEZONE:America/New_York'];
 const days=['MO','TU','WE','TH','FR'];const stamp=new Date().toISOString().replace(/[-:]/g,'').replace(/\.\d+Z/,'Z');
 sections.forEach(s=>s.meetings.forEach((m,j)=>m.days.forEach(day=>{let first=new Date(start);const dow=(first.getUTCDay()+6)%7;first.setUTCDate(first.getUTCDate()+(day-dow+7)%7);if(first>end)return;const until=new Date(end);until.setUTCDate(until.getUTCDate()-(((until.getUTCDay()+6)%7)-day+7)%7);const count=1+Math.floor((until-first)/604800000);lines.push('BEGIN:VEVENT','UID:'+s.id+'-'+j+'-'+day+'-'+startDate+'@buzzplan','DTSTAMP:'+stamp,'DTSTART;TZID=America/New_York:'+localDate(first,m.start),'DTEND;TZID=America/New_York:'+localDate(first,m.end),'RRULE:FREQ=WEEKLY;COUNT='+count+';BYDAY='+days[day],'SUMMARY:'+escape(s.code+' — '+(s.realData?'section ':'sample section ')+s.label),'LOCATION:'+escape(s.location),'DESCRIPTION:'+(s.realData?'Imported timetable snapshot. Verify registration eligibility and current meeting times in official registration systems.':'Fictional demonstration schedule. Verify all times and dates in official registration systems.')+' Holidays are not excluded.','END:VEVENT');})));
 lines.push('END:VCALENDAR');return lines.join('\r\n')+'\r\n';
}

function setCourses(next){if(!Array.isArray(next)||!next.every(c=>c.id&&Array.isArray(c.sections)))throw Error('Invalid course data.');courses=next;root.BuzzPlanner.courses=courses;return courses;}
function resetCourses(){return setCourses(sampleCourses);}
function decodeText(value){return String(value??'').replace(/&amp;/g,'&').replace(/&#39;/g,"'").replace(/&quot;/g,'"').replace(/&lt;/g,'<').replace(/&gt;/g,'>');}
function prereqText(tree){if(!tree||!tree.length&&!tree.id)return '';if(tree.id)return tree.id+(tree.grade?' (minimum '+tree.grade+')':'');if(Array.isArray(tree))return '('+tree.slice(1).map(prereqText).filter(Boolean).join(tree[0]==='or'?' OR ':' AND ')+')';return '';}
function normalizeLiveTerm(data,termCode){
 if(data.version!==3||!data.courses||!data.caches?.periods)throw Error('This data format is not supported. No schedule data was replaced.');
 const cache=data.caches,palette=['#6b9cc5','#a08ac2','#79a18a','#c4a45d','#c28ba3','#67a8a5','#8298c2','#c89778'];
 const list=Object.entries(data.courses).map(([code,raw],index)=>{
 const id=norm(code),sample=sampleCourses.find(c=>c.id===id),color=sample?.color||palette[index%palette.length];
 const all=Object.entries(raw[1]||{}),hasComponents=all.some(([,s])=>Number(s[2])===0),course={id,code,title:decodeText(raw[0]),credits:Math.max(0,...all.map(([,s])=>typeof s[2]==='number'?s[2]:0)),area:sample?.area||code.split(' ')[0],color,prereqs:[],prereqText:prereqText(raw[2]),description:decodeText(raw[3]),realData:true,termCode,sections:[],hasUnscheduled:false,needsComponentReview:hasComponents,omittedSectionCount:0,sourceSectionCount:all.length};
 for(const [label,s] of all){
 let valid=Array.isArray(s[1])&&s[1].length>0;const meetings=[];
 for(const m of s[1]||[]){const period=cache.periods[m[0]]||'',match=period.match(/^(\d{2})(\d{2})\s*-\s*(\d{2})(\d{2})$/),dayString=m[1]||'';if(!match||!dayString||!/^[MTWRF]+$/.test(dayString)){valid=false;break;}
 const start=Number(match[1])*60+Number(match[2]),end=Number(match[3])*60+Number(match[4]);if(end<=start||end>1440||Number(match[2])>59||Number(match[4])>59){valid=false;break;}
 meetings.push({days:[...new Set([...dayString].map(d=>'MTWRF'.indexOf(d)))],start,end,location:decodeText(m[2]),dateRange:cache.dateRanges?.[m[5]]||'',instructors:(m[4]||[]).map(decodeText)});
 }
 if(!valid)course.hasUnscheduled=true;
 const campus=decodeText(cache.campuses?.[s[4]]||'');const atlanta=campus==='Georgia Tech-Atlanta *';
 if(!valid||hasComponents||!atlanta||typeof s[2]!=='number'||s[2]<=0){course.omittedSectionCount++;continue;}
 const faculty=[...new Set(meetings.flatMap(m=>m.instructors))];course.sections.push({id:id+'-'+label,courseId:id,code,title:course.title,credits:s[2],area:course.area,color,label,crn:String(s[0]),instructor:faculty.join(', ')||'Instructor TBA',location:[...new Set(meetings.map(m=>m.location))].join(' / '),meetings,knownSchedule:true,realData:true,termCode,campus,scheduleType:decodeText(cache.scheduleTypes?.[s[3]]||''),restrictions:s[8],sourceUpdatedAt:data.updatedAt});
 }
 course.omittedReason=hasComponents?'Separate lab, recitation, or other zero-credit components require registration review. This course is excluded from automatic planning.':course.omittedSectionCount?'TBA, weekend, non-Atlanta, or variable-credit sections are excluded.':'';
 return course;
 });
 return {courses:list,updatedAt:data.updatedAt,version:data.version,sourceUrl:'https://gt-scheduler.github.io/crawler-v2/'+termCode+'.json',termCode,omittedSectionCount:list.reduce((n,c)=>n+c.omittedSectionCount,0),limitation:'Atlanta campus only. TBA, weekend and variable-credit sections are excluded. Courses with separate zero-credit components are excluded because lecture/lab linkage is not verified. Eligibility, seats, corequisites, exam conflicts and holidays are not checked.'};
}
async function loadLiveTerm(termCode='202702'){
 if(!/^\d{6}$/.test(String(termCode)))throw Error('Choose a valid six-digit term code.');
 const url='https://gt-scheduler.github.io/crawler-v2/'+termCode+'.json';const controller=new AbortController();const timeout=setTimeout(()=>controller.abort(),20000);
 try{const response=await fetch(url,{signal:controller.signal});if(!response.ok)throw Error('The term data could not be loaded ('+response.status+').');return normalizeLiveTerm(await response.json(),String(termCode));}finally{clearTimeout(timeout);}
}
root.BuzzPlanner={courses,overlaps,generate,analyze,parseCompleted,exportICS,setCourses,resetCourses,loadLiveTerm,normalizeLiveTerm};
})(typeof window!=='undefined'?window:globalThis);
