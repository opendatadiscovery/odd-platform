module.exports = {
  input: ['./tmp/**/*.{js,jsx}', '!./tmp/**/*.test.{js,jsx}', '!**/node_modules/**'],
  output: './',
  options: {
    removeUnusedKeys: true,
    sort: true,
    func: {
      list: ['i18next.t', 'i18n.t', 't', '__'],
      extensions: ['.js', '.jsx'],
    },
    trans: {
      component: 'Trans',
      i18nKey: 'i18nKey',
      defaultsKey: 'defaults',
      extensions: ['.js', '.jsx'],
      fallbackKey: false,
    },
    lngs: ['en', 'ja'],
    defaultLng: 'en',
    defaultValue: '',
    resource: {
      loadPath: './src/locales/translations/{{lng}}.json',
      savePath: './src/locales/translations/{{lng}}.json',
      jsonIndent: 2,
      lineEnding: '\n',
    },
    keySeparator: '.',
    pluralSeparator: '_',
    contextSeparator: '_',
    contextDefaultValues: [],
    interpolation: {
      prefix: '{{',
      suffix: '}}',
    },
  },
};
