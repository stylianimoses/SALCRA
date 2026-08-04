module.exports = {
  plugins: [
    require('tailwindcss'),
    require('autoprefixer'),
    {
      postcssPlugin: 'fix-ide-warnings',
      Once(root) {
        root.walkRules(rule => {
          // 1. Split display: block and vertical-align: middle
          if (rule.selectors.includes('img') && rule.selectors.includes('svg')) {
            let hasDisplayBlock = false;
            let verticalAlignDecl = null;
            rule.walkDecls(decl => {
              if (decl.prop === 'display' && decl.value === 'block') {
                hasDisplayBlock = true;
              }
              if (decl.prop === 'vertical-align' && decl.value === 'middle') {
                verticalAlignDecl = decl;
              }
            });
            if (hasDisplayBlock && verticalAlignDecl) {
              const newRule = rule.cloneAfter({ nodes: [] });
              newRule.append(verticalAlignDecl.clone());
              verticalAlignDecl.remove();
            }
          }

          // 2. Add standard appearance property if webkit-appearance exists
          let webkitAppearanceDecl = null;
          let hasStandardAppearance = false;
          // 3. Add standard line-clamp property if webkit-line-clamp exists
          let webkitLineClampDecl = null;
          let hasStandardLineClamp = false;

          rule.walkDecls(decl => {
            if (decl.prop === '-webkit-appearance') {
              webkitAppearanceDecl = decl;
            } else if (decl.prop === 'appearance') {
              hasStandardAppearance = true;
            } else if (decl.prop === '-webkit-line-clamp') {
              webkitLineClampDecl = decl;
            } else if (decl.prop === 'line-clamp') {
              hasStandardLineClamp = true;
            }
          });

          if (webkitAppearanceDecl && !hasStandardAppearance) {
            rule.insertAfter(webkitAppearanceDecl, {
              prop: 'appearance',
              value: webkitAppearanceDecl.value
            });
          }

          if (webkitLineClampDecl && !hasStandardLineClamp) {
            rule.insertAfter(webkitLineClampDecl, {
              prop: 'line-clamp',
              value: webkitLineClampDecl.value
            });
          }
        });
      }
    }
  ]
};
