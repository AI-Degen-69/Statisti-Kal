import re

file_path = 'src/components/HypothesisTestingCalculator.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# ================================
# 1. Update Step 1 (H0 / H1)
# ================================
content = content.replace(
    '<p className="text-sm sm:text-base text-slate-400 font-normal italic mt-3 text-center">',
    '<p className="text-xl sm:text-2xl font-handwriting font-normal text-slate-300 leading-relaxed mt-4 text-center">'
)

# ================================
# 2. Update Step 2 (Standard Error)
# ================================
se_block = '''  <div className="bg-slate-900 p-4 sm:p-5 rounded-2xl border-2 border-slate-800 text-lg sm:text-xl md:text-2xl text-center shadow-inner font-extrabold min-w-[280px]">
  <BlockMath math={`SE = \\frac{${varianceKnown ?'\\sigma' :'S'}}{\\sqrt{n}} = \\frac{${sigmaInput}}{\\sqrt{${nInput}}} = ${stats.se.toFixed(4)}`} />
  </div>
  </div>'''
  
se_replacement = '''  <div className="bg-slate-900 p-4 sm:p-5 rounded-2xl border-2 border-slate-800 text-lg sm:text-xl md:text-2xl text-center shadow-inner font-extrabold min-w-[280px]">
  <BlockMath math={`SE = \\frac{${varianceKnown ?'\\sigma' :'S'}}{\\sqrt{n}} = \\frac{${sigmaInput}}{\\sqrt{${nInput}}} = ${stats.se.toFixed(4)}`} />
  </div>
  </div>
  <p className="text-xl sm:text-2xl font-handwriting font-normal text-slate-300 mt-5 text-center">
  ℹ️ במילים: שגיאת התקן שווה לסטיית התקן חלקי שורש גודל המדגם.
  </p>'''
content = content.replace(se_block, se_replacement)

# ================================
# 3. Update Step 3 (Critical Value)
# ================================
# There are 3 critical value blocks (right, left, two-tailed)
# We can append the translation after each w-full overflow-x-auto block.
cv_right_target = '''  ) : (
  <>
  <BlockMath math={`t_{crit} = F_{t, ${stats.df}}^{-1}(1 - ${alpha}) = ${stats.zCrit.toFixed(4)}`} />
  <BlockMath math={`C = \\mu_0 + t_{crit} \\cdot SE = ${stats.effectH0Mean} + (${stats.zCrit.toFixed(4)}) \\cdot ${stats.se.toFixed(4)} = ${stats.c2.toFixed(4)}`} />
  </>
  )}
  </div>
  </div>'''
cv_right_replacement = cv_right_target + '''
  <p className="text-xl sm:text-2xl font-handwriting font-normal text-slate-300 mt-5 text-center">
  ℹ️ במילים: הערך הקריטי מפריד בין אזור הקבלה לאזור הדחייה, בהתאם לרמת המובהקות שקבענו.
  </p>'''
content = content.replace(cv_right_target, cv_right_replacement)

cv_left_target = '''  ) : (
  <>
  <BlockMath math={`t_{crit} = F_{t, ${stats.df}}^{-1}(${alpha}) = ${stats.zCrit.toFixed(4)}`} />
  <BlockMath math={`C = \\mu_0 + t_{crit} \\cdot SE = ${stats.effectH0Mean} + (${stats.zCrit.toFixed(4)}) \\cdot ${stats.se.toFixed(4)} = ${stats.c2.toFixed(4)}`} />
  </>
  )}
  </div>
  </div>'''
cv_left_replacement = cv_left_target + '''
  <p className="text-xl sm:text-2xl font-handwriting font-normal text-slate-300 mt-5 text-center">
  ℹ️ במילים: הערך הקריטי מפריד בין אזור הקבלה לאזור הדחייה, בהתאם לרמת המובהקות שקבענו.
  </p>'''
content = content.replace(cv_left_target, cv_left_replacement)

cv_two_target = '''  ) : (
  <>
  <BlockMath math={`t_{crit} = F_{t, ${stats.df}}^{-1}(1 - \\frac{${alpha}}{2}) = ${stats.zCrit.toFixed(4)}`} />
  <BlockMath math={`C_1 = \\mu_0 - t_{crit} \\cdot SE = ${stats.effectH0Mean} - (${stats.zCrit.toFixed(4)}) \\cdot ${stats.se.toFixed(4)} = ${stats.c1.toFixed(4)}`} />
  <BlockMath math={`C_2 = \\mu_0 + t_{crit} \\cdot SE = ${stats.effectH0Mean} + (${stats.zCrit.toFixed(4)}) \\cdot ${stats.se.toFixed(4)} = ${stats.c2.toFixed(4)}`} />
  </>
  )}
  </div>
  </div>'''
cv_two_replacement = cv_two_target + '''
  <p className="text-xl sm:text-2xl font-handwriting font-normal text-slate-300 mt-5 text-center">
  ℹ️ במילים: הערכים הקריטיים מפרידים בין אזור הקבלה לאזורי הדחייה בשני הקצוות, בהתאם לרמת המובהקות.
  </p>'''
content = content.replace(cv_two_target, cv_two_replacement)

# ================================
# 3. Update Step 3 (Regions translations)
# ================================
# Right Rejection
content = content.replace(
    'ℹ️ במילים: אזור הדחייה מוגדר על ידי כל הערכים של {statName} שהם גדולים או שווים לערך הקריטי שנקבע (<InlineMath math={`${stats.c2.toFixed(3)}`} />).',
    'ℹ️ במילים: אזור הדחייה - כל ערכי ה-{statName} בהינתן שהם גדולים או שווים ל-<InlineMath math={`${stats.c2.toFixed(3)}`} />.'
)
# Right Acceptance
content = content.replace(
    'ℹ️ במילים: אזור הקבלה מקיף את כל {statNamePlural} הנופלים מתחת לערך הקריטי שנקבע (<InlineMath math={`${stats.c2.toFixed(3)}`} />).',
    'ℹ️ במילים: אזור הקבלה - כל ערכי ה-{statName} בהינתן שהם קטנים מ-<InlineMath math={`${stats.c2.toFixed(3)}`} />.'
)

# Left Rejection
content = content.replace(
    'ℹ️ במילים: אזור הדחייה מוגדר על ידי כל הערכים של {statName} שהם קטנים או שווים לערך הקריטי שנקבע (<InlineMath math={`${stats.c2.toFixed(3)}`} />).',
    'ℹ️ במילים: אזור הדחייה - כל ערכי ה-{statName} בהינתן שהם קטנים או שווים ל-<InlineMath math={`${stats.c2.toFixed(3)}`} />.'
)
# Left Acceptance
content = content.replace(
    'ℹ️ במילים: אזור הקבלה מקיף את כל {statNamePlural} הנופלים מעל לערך הקריטי שנקבע (<InlineMath math={`${stats.c2.toFixed(3)}`} />).',
    'ℹ️ במילים: אזור הקבלה - כל ערכי ה-{statName} בהינתן שהם גדולים מ-<InlineMath math={`${stats.c2.toFixed(3)}`} />.'
)

# Two-tailed Rejection
content = content.replace(
    'ℹ️ במילים: אזור הדחייה מוגדר על ידי כל הערכים של {statName} שהם קטנים או שווים לערך הקריטי התחתון (<InlineMath math={`${stats.c1.toFixed(3)}`} />) או גדולים או שווים לערך הקריטי העליון (<InlineMath math={`${stats.c2.toFixed(3)}`} />).',
    'ℹ️ במילים: אזור הדחייה - ערכי ה-{statName} בהינתן שהם קטנים מ-<InlineMath math={`${stats.c1.toFixed(3)}`} /> או גדולים מ-<InlineMath math={`${stats.c2.toFixed(3)}`} />.'
)
# Two-tailed Acceptance
content = content.replace(
    'ℹ️ במילים: אזור הקבלה מקיף את כל {statNamePlural} הנופלים בתחום התקין שבין שני הערכים הקריטיים שנקבעו.',
    'ℹ️ במילים: אזור הקבלה - ערכי ה-{statName} בהינתן שהם נופלים בין שני הערכים הקריטיים שנקבעו.'
)

# ================================
# 4. Update Step 4 (Beta & Power translations)
# ================================
power_z_right_target = '''  <BlockMath math={`Power (1-\\beta) = 1 - \\beta = ${(stats.power).toFixed(4)}`} />
  </div>
  </div>
  </div>'''
power_translation = '''
  </div>
  </div>
  <div className="space-y-2 mt-5">
    <p className="text-xl sm:text-2xl font-handwriting font-normal text-slate-300 text-center">
    ℹ️ במילים: ציון התקן החדש הוא הערך הקריטי פחות תוחלת השערת המחקר, חלקי שגיאת התקן.
    </p>
    <p className="text-xl sm:text-2xl font-handwriting font-normal text-slate-300 text-center">
    ℹ️ במילים: בטא (<InlineMath math="\\\\beta" />) היא בעצם ההסתברות של קבלת השערת האפס כשהשערת המחקר היא נכונה.
    </p>
    <p className="text-xl sm:text-2xl font-handwriting font-normal text-slate-300 text-center">
    ℹ️ במילים: העוצמה היא בעצם המשלים שלו שזה אחד מינוס בטא.
    </p>
  </div>
  </div>'''
content = content.replace(power_z_right_target, power_z_right_target.replace('</div>\n  </div>\n  </div>', power_translation))

power_z_left_target = '''  <BlockMath math={`Power (1-\\beta) = \\Phi(Z_{H1}) = ${(stats.power).toFixed(4)}`} />
  </div>
  </div>
  </div>'''
content = content.replace(power_z_left_target, power_z_left_target.replace('</div>\n  </div>\n  </div>', power_translation))

power_z_two_target = '''  <BlockMath math={`Power (1-\\beta) = 1 - \\beta = ${(stats.power).toFixed(4)}`} />
  </div>
  </div>
  </div>'''
# Careful! power_z_two_target is identical to right_target if matched loosely. Wait, the replace string for right replaced both if identical?
# Z right and Z two have identical last lines: `Power (1-\beta) = 1 - \beta = ...`
# Let's use re.sub for all 6 power blocks safely.

# For Step 4, there are 6 blocks (Z right, Z left, Z two, T right, T left, T two).
# They all end with `</div>\n  </div>\n  </div>`.
# Let's write a regex that matches the wrapper div end of the power calculation blocks.
# Actually, I can just replace `</div>\n  </div>\n  </div>` that follows a Power block.
# Let's search for `<BlockMath math={\`Power ...`} />\n  </div>\n  </div>\n  </div>`

content = re.sub(
    r'(<BlockMath math={`Power \S+ = .*?`} />\n  </div>\n  </div>)\n  </div>',
    r'\1\n' + power_translation.lstrip('\n</div>\n  </div>\n  '),
    content
)


# ================================
# 5. Update Step 5 (Final Decision)
# ================================
step5_old = '''    <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800 text-sm text-slate-300 flex items-center justify-between shadow-inner">
      <span className="font-extrabold text-slate-200">Exact P-Value:</span>
      <span className={`font-mono text-xl tracking-wider font-black ${decisionData.pValue < alpha ? 'text-emerald-400' : 'text-red-400'}`}>
        {decisionData.pValue < 0.0001 ? '< 0.0001' : decisionData.pValue.toFixed(4)}
      </span>
    </div>'''

step5_new = '''    <div className="bg-slate-900/40 p-5 rounded-2xl border border-slate-700 mt-6 shadow-lg flex flex-col gap-4 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-2 h-full bg-indigo-500/30"></div>
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <span className="font-black text-lg text-slate-200 flex items-center gap-2">
          רמת המובהקות שהושגה בפועל (P-Value):
        </span>
        <div className={`px-5 py-2.5 rounded-xl border-2 font-mono text-2xl tracking-wider font-black shadow-inner flex items-center justify-center ${
          decisionData.pValue < alpha 
            ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-400' 
            : 'bg-red-950/40 border-red-500/30 text-red-400'
        }`}>
          {decisionData.pValue < 0.0001 ? '< 0.0001' : decisionData.pValue.toFixed(4)}
        </div>
      </div>
      <p className="text-xl sm:text-2xl font-handwriting font-normal text-slate-300 text-center border-t border-slate-800/60 pt-5 mt-2" style={{ letterSpacing: '0.02em', WebkitFontSmoothing: 'antialiased' }}>
      ℹ️ במילים: ה-P-Value מייצג את ההסתברות לקבל תוצאה קיצונית כזו בהנחה שהשערת האפס נכונה.
      </p>
    </div>'''

content = content.replace(step5_old, step5_new)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Python script updated.")
