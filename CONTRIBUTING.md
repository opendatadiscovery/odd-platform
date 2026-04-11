# Contributing

When contributing to this repository, please first discuss the change you wish to make via issue,
email, or any other method with the maintainers of the repository before making a change.

Please note we have a code of conduct (`CODE-OF-CONDUCT.md`), please follow it in all your interactions with the project.

## Pull Request Process

### General rules

1. Ensure any install or build dependencies have been removed before the end of the layer when composing a
   build.
2. Update the `README.md` with details of changes to the interface, this includes new environment
   variables, exposed ports, useful file locations and container parameters.
3. You may merge the pull request once you have the approval of two other developers. In case you
   don't have permissions to do that, you may request the second reviewer to merge it for you.

### Branch naming

In order to keep branch names understandable and similar please use the corresponding branch naming conventions.

Generally speaking, it's a good idea to add a group/type prefix for a branch, e.g.,
if you're working on a specific branch you could name your branch `issues/xxx`.

Here's a list of good examples:<br/>
`issues/123`<br/>
`feature/feature_name`<br/>
`bugfix/fix_thing`<br/>

### Code style

There's a file called `checkstyle.xml` in project root under `config/checkstyle` directory.<br/>
You can import it into IntelliJ IDEA via checkstyle plugin.

### Naming conventions

REST paths should be **lowercase** and consist of just **plural** nouns.<br/>
Also, multiple words in a single path segment should be divided by a hyphen symbol (`-`).<br/>

Query variable names should be formatted in `camelCase`.

## GitHub Workflow

1. Fork the `opendatadiscovery/odd-platform` repository into your GitHub account

   ```
   https://github.com/opendatadiscovery/odd-platform/fork
   ```

2. Clone your fork of the GitHub repository

    ```sh
    git clone git@github.com:<username>/odd-platform.git
    ```

   replace `<username>` with your GitHub username.

3. Add a remote to keep up with upstream changes

    ```sh
    git remote add upstream https://github.com/opendatadiscovery/odd-platform.git
    ```

   If you already have a copy, fetch upstream changes

    ```sh
    git fetch upstream main
    ```

4. Check repo setup

   ```sh
   git remote -v
   ```
   Expected:
   ```
   origin  git@github.com:<username>/odd-platform.git (fetch)
   origin  git@github.com:<username>/odd-platform.git (push)
   upstream        git@github.com:opendatadiscovery/odd-platform.git (fetch)
   upstream        git@github.com:opendatadiscovery/odd-platform.git (push)   
   ```

5. Create a feature branch

    ```sh
    git checkout -b feature/xxx remotes/upstream/main
    ```

6. _Before submitting a pull request_ periodically rebase your changes
   (but don't do it when a pull request is already submitted)

    ```sh
    git pull --rebase upstream main
    ```

7. Before submitting a pull request, combine ("squash") related commits into a single one

    ```sh
    git rebase -i upstream/main
    ```

   This will open your editor and allow you to re-order commits and merge them:
    - Re-order the lines to change commit order (to the extent possible without creating conflicts)
    - Prefix commits using `s` (squash) or `f` (fixup) to merge extraneous commits.

8. Submit a pull-request

    ```sh
    git push origin feature/xxx
    ```

   Go to your fork main page

    ```
    https://github.com/<username>/odd-platform
    ```

   If you recently pushed your changes GitHub will automatically pop up a
   `Compare & pull request` button for any branches you recently pushed to. If you
   click that button it will automatically offer you to submit your pull-request
   to the opendatadiscovery/odd-platform repository.

    - Give your pull-request a meaningful title.
    - In the description, explain your changes and the problem they are solving.

9. Addressing code review comments

   Address code review comments by committing changes and pushing them to your feature
   branch.

    ```sh
    git push origin feature/xxx
    ```

### If your pull request shows conflicts with master
If your pull request shows conflicts with master, merge master into your feature branch:

  ```sh
  git merge upstream/main
  ```

and resolve the conflicts. After resolving conflicts, push your branch again:

  ```sh
  git push origin feature/xxx
  ```