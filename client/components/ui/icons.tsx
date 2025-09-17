import React from 'react';

export const Icons: Record<string, any> = {
  menu: (props: any) => <span {...props}>☰</span>,
  Menu: (props: any) => <span {...props}>☰</span>,
  close: (props: any) => <span {...props}>✕</span>,
  Close: (props: any) => <span {...props}>✕</span>,
  search: (props: any) => <span {...props}>🔍</span>,
  Search: (props: any) => <span {...props}>🔍</span>,
  home: (props: any) => <span {...props}>🏠</span>,
  bookmark: (props: any) => <span {...props}>🔖</span>,
  compass: (props: any) => <span {...props}>🧭</span>,
  user: (props: any) => <span {...props}>👤</span>,
  login: (props: any) => <span {...props}>🔐</span>,
};

export default Icons;
