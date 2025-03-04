import type { Configuration } from "brisa";
import tailwindcss from 'brisa-tailwindcss';

export default {
  integrations: [tailwindcss()],
} as Configuration;

