import {Category, CategoryLogger} from "../src/CategoryLogger";
import {CategoryService} from "../src/CategoryService";


describe("Categories", () => {

  it("Plays with categories", () => {
    let root1 = new Category("root1");
    let root2 = new Category("root2");

    let child1 = new Category("root1_child1", root1);
    let root2Child1 = new Category("root2_child2", root2);


    let child11 = new Category("root1_child1_child11", child1);
    let child12 = new Category("root1_child1_child12", child1);

    expect(root1.parent).toBeNull();
    expect(child1.parent == root1).toBeTruthy();
    expect(root1.children.length).toEqual(1);
    expect(child1.children.length).toEqual(2);
    expect(child11.parent == child1).toBeTruthy();
    expect(child12.parent == child1).toBeTruthy();
    expect(child11.children.length).toEqual(0);
    expect(child12.children.length).toEqual(0);

    expect(root2.parent).toBeNull();
    expect(root2.children.length).toEqual(1);
    expect(root2Child1.parent == root2).toBeTruthy();
    expect(root2Child1.parent == root1).toBeFalsy();
  });
});

describe("CategoryService", () => {

  let root1: Category, child1: Category, child11: Category, child12: Category;
  let logger: CategoryLogger;

  beforeEach(() => {
    CategoryService.clear();
    root1 = new Category("root1");
    child1 = new Category("child1", root1);
    child11 = new Category("child11", child1);
    child12 = new Category("child12", child1);
    logger = CategoryService.getLogger(root1);
  });

  afterEach(() => {
    root1 = null;
    child1 = null;
    child11 = null;
    child12 = null;
    logger = null;
  });

  it("Defaults works", () => {
    expect(root1).not.toBeNull();

    logger.info("Info");
  });

  it("All categories have runtime settings", () => {
    const service = CategoryService.getInstance();
    expect(service.getCategorySettings(root1)).not.toBeNull();
    expect(service.getCategorySettings(child1)).not.toBeNull();
    expect(service.getCategorySettings(child11)).not.toBeNull();
    expect(service.getCategorySettings(child12)).not.toBeNull();
  });

  it("Only allows to fetch by root loggers", () => {
    expect(() => CategoryService.getLogger(child1)).toThrow();
    expect(() => CategoryService.getLogger(child11)).toThrow();
    expect(() => CategoryService.getLogger(child12)).toThrow();
  });

  it("Allows adding root category dynamically", () => {
    // This will register it automatically.
    const extraRoot = new Category("root2");
    const child = new Category("someChild", extraRoot);

    const anotherLogger = CategoryService.getLogger(extraRoot);
    expect(anotherLogger).not.toBeNull();
    expect(anotherLogger !== logger).toBeTruthy();

    const service = CategoryService.getInstance();
    expect(service.getCategorySettings(extraRoot)).not.toBeNull();
    expect(service.getCategorySettings(child)).not.toBeNull();
  });

  /*
  it("Allows adding child category dynamically", () => {


    const anotherLogger = CategoryService.getLogger(extraRoot);
    expect(anotherLogger).not.toBeNull();
    expect(anotherLogger !== logger).toBeTruthy();
  });*/

  it("Will return the same logger for root", () => {
    const anotherLogger = CategoryService.getLogger(root1);
    expect(anotherLogger === logger).toBeTruthy();
  });


  /*
  it("Allows new child categories to be registered dynamically", () => {

  });*/
});