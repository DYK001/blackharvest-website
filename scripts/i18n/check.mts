import { getKoreanCoverageErrors } from "../../src/i18n/validate";

const errors = getKoreanCoverageErrors();

if (errors.length > 0) {
  console.error("Korean localization coverage check failed:\n");
  for (const error of errors) console.error(`- ${error}`);
  process.exitCode = 1;
} else {
  console.log("Korean localization coverage check passed.");
}
