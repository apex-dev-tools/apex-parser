/*
 * Copyright (c) 2022 FinancialForce.com, inc. All rights reserved.
 */
package com.nawforce.apexparser;

import org.antlr.v4.runtime.*;

import java.io.IOException;
import java.nio.file.*;
import java.nio.file.attribute.BasicFileAttributes;

public class Check {

    public static void main(String[] args) {
        if (args.length != 1) {
            System.err.println("Missing argument, expecting path to source directory");
            System.exit(1);
        }

        try {
            Path dir = Paths.get(args[0]);
            FileParser parser = new FileParser(dir);
            Files.walkFileTree(dir, parser);

            System.out.println("Parsed " + parser.getCount() + " files in: " + dir);
        } catch (NoSuchFileException nsf) {
            System.err.println("Path does not exist, aborting: " + args[0]);
            System.exit(2);
        } catch (Exception ex) {
            System.err.println("Error processing: " + args[0]);
            ex.printStackTrace();
            System.exit(1);
        }
    }

    private static class PrintJsonListener extends BaseErrorListener {
        private final String file;

        PrintJsonListener(String relativePath) {
            file = relativePath;
        }

        @Override
        public void syntaxError(
                Recognizer<?, ?> recognizer,
                Object offendingSymbol,
                int line,
                int charPositionInLine,
                String msg,
                RecognitionException e) {
            System.out.println(
                    "{\"path\":\"" + file + "\",\"error\":\"{\\\"line\\\":" + line + ",\\\"column\\\":"
                            + charPositionInLine + ",\\\"message\\\":\\\"" + msg + "\\\"}\"}");
        }
    }

    private static class FileParser extends SimpleFileVisitor<Path> {
        private final PathMatcher matcher = FileSystems.getDefault().getPathMatcher("glob:*.cls");
        private final Path rootDir;
        private int parsedCount = 0;

        FileParser(Path root) {
            rootDir = root;
        }

        @Override
        public FileVisitResult visitFile(Path file, BasicFileAttributes attrs) throws IOException {
            Path name = file.getFileName();
            if (name != null && matcher.matches(name)) {
                parse(file);
                parsedCount++;
            }
            return FileVisitResult.CONTINUE;
        }

        private void parse(Path path) throws IOException {
            ApexLexer lexer = new ApexLexer(new CaseInsensitiveInputStream(CharStreams.fromPath(path)));
            CommonTokenStream tokens = new CommonTokenStream(lexer);
            ApexParser parser = new ApexParser(tokens);

            parser.removeErrorListeners();
            parser.addErrorListener(new PrintJsonListener(rootDir.relativize(path).toString()));
            parser.compilationUnit();
        }

        int getCount() {
            return parsedCount;
        }
    }
}
