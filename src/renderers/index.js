import Content from '../data/content.js';
import createContext from './context.js';
import createCommon from './common.js';
import createVisual from './visual.js';
import createLesson from './lesson.js';
import createCatalog from './catalog.js';
function createPages(contentData) {
  const context = createContext(contentData);
  Object.assign(context, createCommon(context));
  Object.assign(context, createVisual(context));
  Object.assign(context, createLesson(context));
  Object.assign(context, createCatalog(context));
  const {
    data,
    Routes,
    lessons,
    glossary,
    problems,
    esc,
    href,
    scenarioInfo,
    commandBlock,
    fileChip,
    sidebar,
    visual,
    conflict,
    flow,
    lessonPage,
    home,
    roadmap,
    reference,
    referenceCards,
    problemsPage,
    glossaryPage,
    glossaryEntries,
    playgroundPage,
    notFound,
    labsPage,
  } = context;
  function finish(markup, interactive = true) {
    let html = markup.replace(/href="([^"]*)"/g, (attribute, value) => {
      const decoded = value.replace(/&amp;/g, '&');
      if (
        decoded.startsWith('#/') ||
        (decoded.startsWith('/') && !decoded.startsWith('//') && !decoded.startsWith('/assets/'))
      )
        return 'href="' + esc(Routes.href(decoded)) + '"';
      if (decoded.startsWith('./assets/'))
        return 'href="' + esc(Routes.asset(decoded.slice(9))) + '"';
      return attribute;
    });
    if (!interactive)
      html = html.replace(/<(button|input|select|textarea)\b([^>]*)>/g, (tag, name, attributes) =>
        /(?:^|\s)disabled(?:\s|=|$)/.test(attributes)
          ? tag
          : '<' + name + ' disabled data-prerender-disabled' + attributes + '>',
      );
    return html;
  }

  function render(page, options = {}) {
    const completed = options.completed || new Set();
    const handlers = {
      home: () => home(options),
      lesson: () =>
        lessonPage(
          lessons.find((lesson) => lesson.id === page.id),
          options,
        ),
      roadmap: () => roadmap(undefined, options),
      chapter: () => roadmap(page.id, options),
      reference,
      glossary: glossaryPage,
      problems: problemsPage,
      playground: () => playgroundPage(new URLSearchParams(page.search).get('scenario') || 'stash'),
      labs: () => labsPage(),
      lab: () => labsPage(page.id),
      notFound,
    };
    return finish((handlers[page.kind] || notFound)(), options.interactive === true);
  }

  const api = {
    staticMarkup: (markup) => finish(markup, false),
    render,
    sidebar: (lesson, completed = new Set()) => finish(sidebar(lesson, completed)),
    home: (options) => finish(home(options)),
    lesson: (lesson, options) => finish(lessonPage(lesson, options)),
    roadmap: (id, options) => finish(roadmap(id, options)),
    reference: () => finish(reference()),
    referenceCards: (term) => finish(referenceCards(term)),
    problems: () => finish(problemsPage()),
    glossary: () => finish(glossaryPage()),
    glossaryEntries: (term) => finish(glossaryEntries(term)),
    playground: (scenario) => finish(playgroundPage(scenario)),
    notFound: () => finish(notFound()),
    labs: (id) => finish(labsPage(id)),
    visual: (...args) => finish(visual(...args)),
    flow: (...args) => finish(flow(...args)),
    conflict: (lesson) => finish(conflict(lesson)),
    commandBlock,
    fileChip,
    scenarioInfo,
  };

  return api;
}
export default { ...createPages(Content), create: createPages };
