import { spawnSync } from 'node:child_process';
import { readFile, writeFile } from 'node:fs/promises';

spawnSync('npx rome', ['format --write dist/index.d.ts'], {
  stdio: 'inherit',
  shell: true,
});

const file = await readFile('dist/index.d.ts', { encoding: 'utf-8' });
const lines = file.split('\n');

const start_line_index = lines.findIndex((item) =>
  item.includes('declare function apiConfig<')
);
const end_function_index = lines.findIndex((item) => item.includes('): ApiConfigInput;'));

const function_def_lines = lines.filter(
  (_, index) => index >= start_line_index && index <= end_function_index
);
const generics_end_index = function_def_lines.findIndex((item) =>
  item.includes('Service1 extends Class<unknown>')
);
const services_last_parameter_index = function_def_lines.findIndex((item) =>
  item.includes('service1: InstanceType<Service1>')
);
const service_imports_index = function_def_lines.findIndex((item) =>
  item.includes('imports?: [Service1];')
);

const SERVICE_NUMBER_OFFSET = 2;

function createNewFunction(number_of_services: number): string[] {
  const def_lines = [...function_def_lines];
  for (let index = 0; index < number_of_services; index++) {
    const service_number = index + SERVICE_NUMBER_OFFSET;
    def_lines[
      generics_end_index
    ] = `${def_lines[generics_end_index]}, Service${service_number} extends Class<unknown>`;
    def_lines[
      services_last_parameter_index
    ] = `${def_lines[services_last_parameter_index]},service${service_number}: InstanceType<Service${service_number}>`;
    def_lines[service_imports_index] = `${def_lines[service_imports_index].slice(
      0,
      def_lines[service_imports_index].length - SERVICE_NUMBER_OFFSET
    )}, Service${service_number}];`;
  }
  return def_lines;
}

const new_lines = Array.from({ length: 29 }, (_, index) =>
  createNewFunction(index + 1)
).flat();
lines.splice(end_function_index + 1, 0, ...new_lines);

await writeFile('dist/index.d.ts', lines.join('\n'));

spawnSync('npx rome', ['format --write dist/index.d.ts'], {
  stdio: 'inherit',
  shell: true,
});
