/** How a field with loaded choices is filled. */
export enum ChoiceMode {
  /** Picked from the loaded list. */
  LIST = 'list',
  /** Typed by id, for a value the list does not offer. */
  ID = 'id',
}
