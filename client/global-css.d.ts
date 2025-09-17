declare module '*.css';
declare module '*.scss';

// Allow importing CSS modules without TypeScript complaining about at-rules
declare module '\u0000*' {
  const value: any;
  export default value;
}
