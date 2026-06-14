const fs = require('fs');
const content = fs.readFileSync('src/components/HypothesisTestingCalculator.tsx', 'utf8');
const lines = content.split(/\r?\n/);

const step4Start = lines.findIndex(l => l.includes('{/* Step 4: Critical Value derivation & SE */}'));
const seStart = lines.findIndex(l => l.includes('תחילה, נחשב את שגיאת התקן'));
const cLogicStart = lines.findIndex(l => l.includes('כעת, עבור רמת מובהקות'));
const step5Start = lines.findIndex(l => l.includes('{/* Step 5: P-Value Calculation */}'));

// Extract SE block
const seBlock = lines.slice(seStart - 1, cLogicStart - 1);

const newStep4 = `                      {/* Step 4: Critical Value derivation & Decision Rule */}
                      <div className="space-y-3 py-8">
                        <div className="flex items-center gap-3 font-extrabold text-indigo-400">
                          <span className="w-9 h-9 rounded-full bg-indigo-100 bg-indigo-900/50 text-base font-black flex items-center justify-center border border-indigo-300">4</span>
                          <span className="text-xl sm:text-2xl font-black">קביעת הערכים הקריטיים וכלל ההחלטה</span>
                        </div>
                        
                        <p className="text-base sm:text-lg text-slate-200 leading-relaxed pr-9 font-semibold">
                          כדי לקבוע את הערכים הקריטיים, עלינו להיעזר בטבלת ההתפלגות {varianceKnown ? 'הנורמלית הסטנדרטית' : 'של t'}. 
                          {tailType === 'right' ? (
                            <span> מכיוון שזהו <span className="font-bold underline">מבחן חד-צדדי ימני</span>, נקצה את רמת המובהקות (<InlineMath math="\\alpha" />) לזנב הימני של ההתפלגות.</span>
                          ) : tailType === 'left' ? (
                            <span> מכיוון שזהו <span className="font-bold underline">מבחן חד-צדדי שמאלי</span>, נקצה את רמת המובהקות (<InlineMath math="\\alpha" />) לזנב השמאלי של ההתפלגות.</span>
                          ) : (
                            <span> מכיוון שזהו <span className="font-bold underline">מבחן דו-צדדי</span>, נקצה את רמת המובהקות לחצי (<InlineMath math="\\alpha/2" />) לכל אחד מזנבות ההתפלגות.</span>
                          )}
                          <br />
                          הערך הקריטי מתוך הטבלה עבור הסתברות (p):
                        </p>

                        <div className="pr-9 py-3 text-xl md:text-2xl space-y-4">
                          <FormulaBlock>
                            {tailType === 'right' ? (
                              <>
                                <BlockMath math={\`(p) = 1 - \\alpha\`} />
                                <BlockMath math={\`\${varianceKnown ? 'Z' : 't'}_\{\\alpha\} = \${Math.abs(stats?.zCrit || 0).toFixed(4)}\`} />
                              </>
                            ) : tailType === 'left' ? (
                              <>
                                <BlockMath math={\`(p) = \\alpha\`} />
                                <BlockMath math={\`\${varianceKnown ? 'Z' : 't'}_\{\\alpha\} = -\${Math.abs(stats?.zCrit || 0).toFixed(4)}\`} />
                              </>
                            ) : (
                              <>
                                <BlockMath math={\`(p) = 1 - \\alpha / 2\`} />
                                <BlockMath math={\`\${varianceKnown ? 'Z' : 't'}_\{\\alpha/2\} = \${Math.abs(stats?.zCrit || 0).toFixed(4)}\`} />
                              </>
                            )}
                          </FormulaBlock>
                          
                          <CalcBlock>
                            {tailType === 'right' ? (
                              <>
                                <BlockMath math={\`(p) = 1 - \${alpha} = \${(1 - alpha).toFixed(4)}\`} />
                                <div className="text-right text-lg text-slate-300 font-bold mb-2">הערך הקריטי עבור מבחן ימני הוא:</div>
                                <BlockMath math={\`\${varianceKnown ? 'Z' : 't'}_{\${alpha}} = \${Math.abs(stats?.zCrit || 0).toFixed(4)}\`} />
                              </>
                            ) : tailType === 'left' ? (
                              <>
                                <BlockMath math={\`(p) = \${alpha}\`} />
                                <div className="text-right text-lg text-slate-300 font-bold mb-2">הערך הקריטי עבור מבחן שמאלי הוא:</div>
                                <BlockMath math={\`\${varianceKnown ? 'Z' : 't'}_{\${alpha}} = -\${Math.abs(stats?.zCrit || 0).toFixed(4)}\`} />
                              </>
                            ) : (
                              <>
                                <BlockMath math={\`(p) = 1 - \${alpha}/2 = \${(1 - alpha/2).toFixed(4)}\`} />
                                <div className="text-right text-lg text-slate-300 font-bold mb-2">הערכים הקריטיים עבור מבחן דו-צדדי הם:</div>
                                <BlockMath math={\`\\pm\${varianceKnown ? 'Z' : 't'}_{\${alpha}/2} = \\pm\${Math.abs(stats?.zCrit || 0).toFixed(4)}\`} />
                              </>
                            )}
                          </CalcBlock>
                        </div>

                        <p className="text-base sm:text-lg text-slate-200 leading-relaxed pr-9 font-semibold mt-4">
                          כלל ההחלטה של המבחן הסטטיסטי הוא:
                        </p>

                        <div className="pr-9 py-3 space-y-4 text-xl md:text-2xl">
                          <FormulaBlock>
                            {tailType === 'right' ? (
                              <>
                                <div className="text-right text-lg text-emerald-400 font-bold" dir="ltr">If: <InlineMath math={\`\${varianceKnown ? 'Z' : 't'} \\ge \${varianceKnown ? 'z' : 't'}_{\${alpha}}\`} /> , Reject <InlineMath math="H_0" /></div>
                                <div className="text-right text-lg text-red-400 font-bold" dir="ltr">If: <InlineMath math={\`\${varianceKnown ? 'Z' : 't'} < \${varianceKnown ? 'z' : 't'}_{\${alpha}}\`} /> , Fail to Reject <InlineMath math="H_0" /></div>
                              </>
                            ) : tailType === 'left' ? (
                              <>
                                <div className="text-right text-lg text-emerald-400 font-bold" dir="ltr">If: <InlineMath math={\`\${varianceKnown ? 'Z' : 't'} \\le -\${varianceKnown ? 'z' : 't'}_{\${alpha}}\`} /> , Reject <InlineMath math="H_0" /></div>
                                <div className="text-right text-lg text-red-400 font-bold" dir="ltr">If: <InlineMath math={\`\${varianceKnown ? 'Z' : 't'} > -\${varianceKnown ? 'z' : 't'}_{\${alpha}}\`} /> , Fail to Reject <InlineMath math="H_0" /></div>
                              </>
                            ) : (
                              <>
                                <div className="text-right text-lg text-emerald-400 font-bold" dir="ltr">If: <InlineMath math={\`|\${varianceKnown ? 'Z' : 't'}| \\ge \${varianceKnown ? 'z' : 't'}_{\${alpha/2}}\`} /> , Reject <InlineMath math="H_0" /></div>
                                <div className="text-right text-lg text-red-400 font-bold" dir="ltr">If: <InlineMath math={\`|\${varianceKnown ? 'Z' : 't'}| < \${varianceKnown ? 'z' : 't'}_{\${alpha/2}}\`} /> , Fail to Reject <InlineMath math="H_0" /></div>
                              </>
                            )}
                          </FormulaBlock>
                        </div>

                        <p className="text-base sm:text-lg text-slate-200 leading-relaxed pr-9 font-semibold mt-4">
                          כלל ההחלטה (מבוסס גישת P-Value) הוא:
                        </p>

                        <div className="pr-9 py-3 space-y-4 text-xl md:text-2xl">
                          <FormulaBlock>
                            <div className="text-right text-lg text-emerald-400 font-bold" dir="ltr">If: P-Value &le; <InlineMath math="\\alpha" /> , Reject <InlineMath math="H_0" /></div>
                            <div className="text-right text-lg text-red-400 font-bold" dir="ltr">If: P-Value &gt; <InlineMath math="\\alpha" /> , Fail to Reject <InlineMath math="H_0" /></div>
                          </FormulaBlock>
                        </div>

                        {/* Researcher's note */}
                        <p className="text-xl sm:text-2xl font-handwriting font-normal text-slate-300 leading-relaxed mt-6 text-center">
                          <PenTool size={22} className="inline-block ml-2 opacity-60 text-indigo-400" /> הגדרנו את כלל ההחלטה והערכים הקריטיים של המבחן.
                        </p>
                      </div>`;

// Construct new file content
// Before Step 4
const part1 = lines.slice(0, step4Start);
// Step 5 and beyond
const part2 = lines.slice(step5Start);

// Inject SE block at the beginning of Step 5 body
const step5BodyStart = part2.findIndex(l => l.includes('נחשב את סטטיסטי המבחן'));

part2.splice(step5BodyStart - 1, 0, ...seBlock);

const newLines = [...part1, newStep4, ...part2];
fs.writeFileSync('src/components/HypothesisTestingCalculator.tsx', newLines.join('\\n'));
console.log('Success!');
