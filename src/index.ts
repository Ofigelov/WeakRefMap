export type SimplifiedMap<TData> = Pick<
  Map<string, TData>,
  'get' | 'delete' | 'has'
> & {
  set: (key: string, value: TData) => void;
};

/**
 * Фасад для работы с Map, хранящим значения как WeakRef,
 * По сравнению в обычным Map, сборщик мусора сможет удалить значение,
 * если на него никто не ссылается.
 */
export class WeakRefMap<TData extends {}> implements SimplifiedMap<TData> {
  private readonly map = new Map<string, WeakRef<TData> | TData>();

  public get = (key: string) => {
    // Проверка на старые браузеры, не умеющие в WeakRef
    if (!globalThis.WeakRef) {
      return this.map.get(key) as TData | undefined;
    }

    return (this.map.get(key) as WeakRef<TData> | undefined)?.deref?.();
  };

  public set = (key: string, value: TData) => {
    // Проверка на старые браузеры, не умеющие в WeakRef
    if (!globalThis.WeakRef) {
      this.map.set(key, value);
    } else {
      this.map.set(key, new globalThis.WeakRef(value));
    }
  };

  public delete = (key: string) => this.map.delete(key);

  public has = (key: string) => this.map.has(key);
}
