import Generator from "yeoman-generator";

export type GeneratorOptions<
	T extends Generator.GeneratorOptions = Generator.GeneratorOptions,
> = ConstructorParameters<typeof Generator<T>>[1];
