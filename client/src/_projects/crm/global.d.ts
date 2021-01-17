declare namespace NodeJS {
	interface Global {
		projectSpecificGlobal: () => object;
	};
}