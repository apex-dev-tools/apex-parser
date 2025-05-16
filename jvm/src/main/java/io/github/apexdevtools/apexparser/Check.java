/*
 [The "BSD licence"]
 Copyright (c) 2022 Kevin Jones, Certinia Inc.
 All rights reserved.

 Redistribution and use in source and binary forms, with or without
 modification, are permitted provided that the following conditions
 are met:
 1. Redistributions of source code must retain the above copyright
    notice, this list of conditions and the following disclaimer.
 2. Redistributions in binary form must reproduce the above copyright
    notice, this list of conditions and the following disclaimer in the
    documentation and/or other materials provided with the distribution.
 3. The name of the author may not be used to endorse or promote products
    derived from this software without specific prior written permission.

 THIS SOFTWARE IS PROVIDED BY THE AUTHOR ``AS IS'' AND ANY EXPRESS OR
 IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES
 OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED.
 IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY DIRECT, INDIRECT,
 INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT
 NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
 DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
 THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
 THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/
package io.github.apexdevtools.apexparser;

import java.io.IOException;
import java.nio.file.*;
import java.nio.file.attribute.BasicFileAttributes;
import java.util.ArrayList;
import java.util.List;
import java.util.function.Consumer;
import org.antlr.v4.runtime.CharStreams;

public class Check {

  public static void main(String[] args) {
    if (args.length != 1) {
      System.err.println(
        "Missing argument, expecting path to source directory"
      );
      System.exit(1);
    }

    try {
      System.exit(run(Paths.get(args[0])).status);
    } catch (Exception ex) {
      System.err.println("Error processing: " + args[0]);
      System.err.println(ex.getMessage());
      System.exit(1);
    }
  }

  public static CheckResult run(Path dir) {
    try {
      FileSystem fs = FileSystems.getDefault();
      List<ParseOperation> ops = new ArrayList<>();
      ops.add(new ParseOperation(fs, ".cls", ApexParser::compilationUnit));
      ops.add(new ParseOperation(fs, ".trigger", ApexParser::triggerUnit));

      Files.walkFileTree(dir, new ParseFileVisitor(dir, ops));

      List<CheckError> errors = new ArrayList<>();
      for (ParseOperation p : ops) {
        p.reportCount(dir);
        errors.addAll(p.getErrors());
      }

      return new CheckResult(0, errors);
    } catch (NoSuchFileException nsf) {
      System.err.println("Path does not exist, aborting: " + dir);
      return new CheckResult(2);
    } catch (Exception ex) {
      System.err.println("Error processing: " + dir);
      System.err.println(ex.getMessage());
      return new CheckResult(1);
    }
  }

  public static class CheckResult {

    public int status;
    public List<CheckError> errors;

    CheckResult(int status) {
      this(status, new ArrayList<>());
    }

    CheckResult(int status, List<CheckError> errors) {
      this.status = status;
      this.errors = errors;
    }
  }

  public static class CheckError {

    public int column;
    public int line;
    public String message;
    public String path;

    CheckError(int column, int line, String message, String path) {
      this.column = column;
      this.line = line;
      this.message = message;
      this.path = path;
    }
  }

  private static class CheckApexErrorListener extends ApexErrorListener {

    private final String path;
    private final List<CheckError> errors;

    CheckApexErrorListener(String relativePath) {
      this.path = relativePath;
      this.errors = new ArrayList<>();
    }

    @Override
    public void apexSyntaxError(int line, int column, String msg) {
      this.errors.add(new CheckError(column, line, msg, this.path));

      System.out.println(
        "{\"column\":" +
        column +
        ",\"line\":" +
        line +
        ",\"message\":\"" +
        msg +
        "\",\"path\":\"" +
        this.path +
        "\"}"
      );
    }

    public List<CheckError> getErrors() {
      return this.errors;
    }
  }

  private static class ParseOperation {

    private final String fileExtension;
    private final PathMatcher matcher;
    private final Consumer<ApexParser> operation;
    private final List<CheckError> errors;
    private int parsedCount = 0;

    ParseOperation(
      FileSystem fs,
      String fileExtension,
      Consumer<ApexParser> operation
    ) {
      this.fileExtension = fileExtension;
      this.matcher = fs.getPathMatcher("glob:*" + fileExtension);
      this.operation = operation;
      this.errors = new ArrayList<>();
    }

    public boolean parse(Path root, Path file) throws IOException {
      if (!this.matcher.matches(file.getFileName())) return false;

      ApexParser parser = ApexParserFactory.createParser(
        CharStreams.fromPath(file)
      );
      String relativePath = root.relativize(file).toString();
      CheckApexErrorListener listener = new CheckApexErrorListener(
        relativePath
      );
      parser.addErrorListener(listener);

      this.operation.accept(parser);

      List<CheckError> fileErrors = listener.getErrors();
      if (!fileErrors.isEmpty()) {
        System.out.println(
          "Found " + fileErrors.size() + " syntax errors in: " + relativePath
        );
        this.errors.addAll(fileErrors);
      }

      ++this.parsedCount;
      return true;
    }

    public void reportCount(Path root) {
      System.out.println(
        "Parsed " +
        this.parsedCount +
        " '" +
        this.fileExtension +
        "' files in: " +
        root
      );
    }

    public List<CheckError> getErrors() {
      return this.errors;
    }
  }

  private static class ParseFileVisitor extends SimpleFileVisitor<Path> {

    private final List<ParseOperation> operations;
    private final Path root;

    ParseFileVisitor(Path root, List<ParseOperation> operations) {
      this.root = root;
      this.operations = operations;
    }

    @Override
    public FileVisitResult visitFile(Path file, BasicFileAttributes attrs)
      throws IOException {
      // run first applicable operation
      for (ParseOperation op : this.operations) {
        if (op.parse(this.root, file)) break;
      }

      return FileVisitResult.CONTINUE;
    }
  }
}
