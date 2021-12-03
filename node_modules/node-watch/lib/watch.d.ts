import { FSWatcher } from 'fs';

/**
 *  Watch for changes on `filename`, where filename is either a file or a directory.
 *  The second argument is optional.
 *
 *  If `options` is provided as a string, it specifies the encoding.
 *  Otherwise `options` should be passed as an object.
 *
 *  The listener callback gets two arguments, `(eventType, filePath)`,
 *  which is the same with `fs.watch`.
 *  `eventType` is either `update` or `remove`,
 *  `filePath` is the name of the file which triggered the event.
 *
 * @param {Filename} filename File or directory to watch.
 * @param {Options|string} options
 * @param {Function} callback
 */
declare function watch(pathName: PathName): Watcher;
declare function watch(pathName: PathName, options: Options) : Watcher;
declare function watch(pathName: PathName, callback: Callback): Watcher;
declare function watch(pathName: PathName, options: Options, callback: Callback): Watcher;

type EventType = 'update' | 'remove';
type Callback = (eventType ?: EventType, filePath ?: string) => any;
type PathName = string | Array<string>;
type FilterReturn = boolean | symbol;

type Options = {
  /**
   * Indicates whether the process should continue to run
   * as long as files are being watched.
   * @default true
   */
  persistent ?: boolean;

  /**
   * Indicates whether all subdirectories should be watched.
   * @default false
   */
  recursive ?: boolean;

  /**
   * Specifies the character encoding to be used for the filename
   * passed to the listener.
   * @default 'utf8'
   */
  encoding ?: string;

  /**
   * Only files which pass this filter (when it returns `true`)
   * will be sent to the listener.
   */
  filter ?: RegExp | ((file: string, skip: symbol) => FilterReturn);

  /**
   * Delay time of the callback function.
   * @default 200
   */
  delay ?: number;
};

declare interface Watcher extends FSWatcher {
  /**
   * Returns `true` if the watcher has been closed.
   */
  isClosed(): boolean;

  /**
   * Returns all watched paths.
   */
  getWatchedPaths(): Array<string>;
}

export default watch;
