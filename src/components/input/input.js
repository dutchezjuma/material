(function() {

angular.module('material.components.input', [
  'material.core'
])
  .directive('mdInputContainer', mdInputContainerDirective)
  .directive('input', inputDirective)
  .directive('textarea', inputDirective);

/**
 * @ngdoc directive
 * @name mdInputContainer
 * @module material.components.input
 *
 * @restrict E
 *
 * @description
 * Use the `<md-input-container>` as the parent of an input or textarea element.
 *
 * To use any of angular material's advanced input behaviors, put each input or textarea
 * inside of an `<md-input-container>`.
 *
 * @usage
 * <hljs lang="html">
 *
 * <md-input-container>
 *   <label>Username</label>
 *   <input type="text" ng-model="user.name">
 * </md-input-container>
 *
 * <md-input-container>
 *   <label>Description</label>
 *   <textarea ng-model="user.description"></textarea>
 * </md-input-container>
 * </hljs>
 */
function mdInputContainerDirective($mdTheming) {
  return {
    restrict: 'E',
    link: postLink,
    controller: ContainerCtrl
  };

  function postLink(scope, element, attr) {
    $mdTheming(element);
  }
  function ContainerCtrl($element) {
    this.setFocused = function(isFocused) {
      $element.toggleClass('md-input-focused', !!isFocused);
    };
    this.setHasValue = function(hasValue) {
      $element.toggleClass('md-input-has-value', !!hasValue);
    };
  }
}

function inputDirective($mdUtil) {
  return {
    restrict: 'E',
    require: ['^?mdInputContainer', '?ngModel'],
    compile: compile,
  };
  
  function compile(element) {
    element.addClass('md-input');
    return postLink;
  }
  function postLink(scope, element, attr, ctrls) {

    var containerCtrl = ctrls[0];
    var ngModelCtrl = ctrls[1];

    // TODO warn if no input container ctrl
    if ( !containerCtrl ) return;

    if (containerCtrl.input) {
      throw new Error("An <md-input-container> can have only *one* <input> or <textarea> child element!");
    }
    containerCtrl.input = element;

    // When the input value changes, check if it "has" a value, and
    // set the appropriate class on the input group
    if (ngModelCtrl) {
      ngModelCtrl.$formatters.push(checkHasValue);
      ngModelCtrl.$parsers.push(checkHasValue);
    } else {
      checkHasValue(element.val());
      // Only listen to input event if ngModel isnt doing it for us
      element.on('input', function() {
        containerCtrl.setHasValue( isNotEmpty() );
      });
    }
    function checkHasValue(value) {
      containerCtrl.setHasValue( isNotEmpty(value) );
      return value;
    }

    element
      .on('focus', function(e) {
        containerCtrl.setFocused(true);
      })
      .on('blur', function(e) {
        containerCtrl.setFocused(false);
      });

    scope.$on('$destroy', function() {
      containerCtrl.setFocused(false);
      containerCtrl.setHasValue(false);
      containerCtrl.input = null;
    });

    function isNotEmpty(value) {
      value = angular.isUndefined(value) ? element.val() : value;
      return (angular.isDefined(value) && (value!==null) &&
             (value.toString().trim() !== ""));
    }
  }
}

})();
