import ar from './ar.json';
import de from './de.json';
import en from './en.json';
import es from './es.json';
import fr from './fr.json';
import it from './it.json';
import ja from './ja.json';
import ko from './ko.json';
import pt from './pt.json';
import ru from './ru.json';
import tr from './tr.json';
import zh from './zh.json';

export const localeResources = {
  tr: { translation: tr },
  en: { translation: en },
  es: { translation: es },
  de: { translation: de },
  fr: { translation: fr },
  pt: { translation: pt },
  it: { translation: it },
  ru: { translation: ru },
  ja: { translation: ja },
  ko: { translation: ko },
  ar: { translation: ar },
  zh: { translation: zh },
} as const;
